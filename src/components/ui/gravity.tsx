import {
  createContext,
  forwardRef,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  memo,
} from "react"
import Matter, {
  Bodies,
  Common,
  Engine,
  Events,
  Mouse,
  MouseConstraint,
  Query,
  Render,
  Runner,
  World,
} from "matter-js"

import { cn } from "@/lib/utils"

import SVGPathCommander from 'svg-path-commander';

// Function to convert SVG path "d" to vertices
function parsePathToVertices(path: string, sampleLength = 15) {
// Convert path to absolute commands
const commander = new SVGPathCommander(path);

    const points: { x: number, y: number }[] = [];
    let lastPoint: { x: number, y: number } | null = null;

    // Get total length of the path
    const totalLength = commander.getTotalLength();
    let length = 0;

    // Sample points along the path
    while (length < totalLength) {
        const point = commander.getPointAtLength(length);

        // Only add point if it's different from the last one
        if (!lastPoint || point.x !== lastPoint.x || point.y !== lastPoint.y) {
            points.push({ x: point.x, y: point.y });
            lastPoint = point;
        }

        length += sampleLength;
    }

    // Ensure we get the last point
    const finalPoint = commander.getPointAtLength(totalLength);
    if (lastPoint && (finalPoint.x !== lastPoint.x || finalPoint.y !== lastPoint.y)) {
        points.push({ x: finalPoint.x, y: finalPoint.y });
    }

    return points;

}

function calculatePosition(
  value: number | string | undefined,
  containerSize: number,
  elementSize: number
) {
  if (typeof value === "string" && value.endsWith("%")) {
    const percentage = parseFloat(value) / 100;
    return containerSize * percentage;
  }
  return typeof value === "number"
    ? value
    : elementSize - containerSize + elementSize / 2;
}

type GravityProps = {
  children: ReactNode
  debug?: boolean
  gravity?: { x: number; y: number }
  resetOnResize?: boolean
  grabCursor?: boolean
  addTopWall?: boolean
  autoStart?: boolean
  className?: string
}

type PhysicsBody = {
  element: HTMLElement
  body: Matter.Body
  props: MatterBodyProps
}

type MatterBodyProps = {
  children: ReactNode
  matterBodyOptions?: Matter.IBodyDefinition
  isDraggable?: boolean
  bodyType?: "rectangle" | "circle" | "svg"
  sampleLength?: number
  x?: number | string
  y?: number | string
  angle?: number
  className?: string
}

export type GravityRef = {
  start: () => void
  stop: () => void
  reset: () => void
}

const GravityContext = createContext<{
  registerElement: (
    id: string,
    element: HTMLElement,
    props: MatterBodyProps
  ) => void
  unregisterElement: (id: string) => void
  bodiesMap: Map<string, PhysicsBody>
} | null>(null)

const MatterBody = memo(({
  children,
  className,
  matterBodyOptions = {
    friction: 0.1,
    restitution: 0.1,
    density: 0.001,
    isStatic: false,
  },
  bodyType = "rectangle",
  isDraggable = true,
  sampleLength = 15,
  x = 0,
  y = 0,
  angle = 0,
  ...props
}: MatterBodyProps) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(Math.random().toString(36).substring(7))
  const context = useContext(GravityContext)
  const isDragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!elementRef.current || !context) return
    context.registerElement(idRef.current, elementRef.current, {
      children,
      matterBodyOptions,
      bodyType,
      sampleLength,
      isDraggable,
      x,
      y,
      angle,
      ...props,
    })

    return () => context.unregisterElement(idRef.current)
  }, [])

  const mouseDownTime = useRef(0)
  const mouseDownPos = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !elementRef.current || !context) return
    
    // Check if mouse has moved significantly
    const moveDistance = Math.sqrt(
      Math.pow(e.clientX - mouseDownPos.current.x, 2) + 
      Math.pow(e.clientY - mouseDownPos.current.y, 2)
    )
    
    if (moveDistance > 5) {
      hasMoved.current = true
      e.preventDefault()
      e.stopPropagation()
      
      const containerRect = elementRef.current.parentElement?.getBoundingClientRect()
      if (!containerRect) return
      
      const newX = e.clientX - containerRect.left - dragOffset.current.x
      const newY = e.clientY - containerRect.top - dragOffset.current.y
      
      // Update Matter.js body position
      const physicsBody = context.bodiesMap?.get(idRef.current)
      if (physicsBody) {
        Matter.Body.setPosition(physicsBody.body, { x: newX, y: newY })
        Matter.Body.setVelocity(physicsBody.body, { x: 0, y: 0 })
      }
    }
  }, [context])

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current || !elementRef.current || !context) return
    
    const clickDuration = Date.now() - mouseDownTime.current
    
    // Remove listeners when dragging ends
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    
    // If it was a quick click without much movement, make element jump and shuffle all
    if (clickDuration < 200 && !hasMoved.current) {
      const physicsBody = context.bodiesMap?.get(idRef.current)
      if (physicsBody) {
        // Make this element jump
        const jumpForce = { x: (Math.random() - 0.5) * 0.3, y: -0.5 }
        Matter.Body.applyForce(physicsBody.body, physicsBody.body.position, jumpForce)
        
        // Shuffle all other elements
        context.bodiesMap.forEach((otherBody, otherId) => {
          if (otherId !== idRef.current) {
            const randomForce = {
              x: (Math.random() - 0.5) * 0.2,
              y: Math.random() * -0.3
            }
            Matter.Body.applyForce(otherBody.body, otherBody.body.position, randomForce)
          }
        })
      }
    }
    
    isDragging.current = false
    hasMoved.current = false
    elementRef.current.style.cursor = 'grab'
  }, [context, handleMouseMove])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isDraggable || !elementRef.current) return
    
    e.preventDefault()
    e.stopPropagation()
    mouseDownTime.current = Date.now()
    mouseDownPos.current = { x: e.clientX, y: e.clientY }
    hasMoved.current = false
    isDragging.current = true
    
    const rect = elementRef.current.getBoundingClientRect()
    dragOffset.current = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    }
    
    elementRef.current.style.cursor = 'grabbing'
    
    // Add listeners only when dragging starts
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [isDraggable, handleMouseMove, handleMouseUp])

  // Clean up listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute",
        className,
        isDraggable ? "pointer-events-auto cursor-grab" : "pointer-events-none"
      )}
      onMouseDown={handleMouseDown}
      style={{ zIndex: 20 }}
    >
      {children}
    </div>
  )
})

MatterBody.displayName = "MatterBody"

const Gravity = memo(forwardRef<GravityRef, GravityProps>(
  (
    {
      children,
      debug = false,
      gravity = { x: 0, y: 1 },
      grabCursor = true,
      resetOnResize = false, // Disable resize to prevent interference
      addTopWall = true,
      autoStart = true,
      className,
      ...props
    },
    ref
  ) => {
    const canvas = useRef<HTMLDivElement>(null)
    const engine = useRef(Engine.create())
    const render = useRef<Render>()
    const runner = useRef<Runner>()
    const bodiesMap = useRef(new Map<string, PhysicsBody>())
    const frameId = useRef<number>()
    const mouseConstraint = useRef<Matter.MouseConstraint>()
    const mouseDown = useRef(false)
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
    const initialized = useRef(false)

    const isRunning = useRef(false)

    // Register Matter.js body in the physics world
    const registerElement = useCallback(
      (id: string, element: HTMLElement, props: MatterBodyProps) => {
        if (!canvas.current) return
        const width = element.offsetWidth
        const height = element.offsetHeight
        const canvasRect = canvas.current!.getBoundingClientRect()

        const angle = (props.angle || 0) * (Math.PI / 180)

        const x = calculatePosition(props.x, canvasRect.width, width)
        const y = calculatePosition(props.y, canvasRect.height, height)

        let body
        if (props.bodyType === "circle") {
          const radius = Math.max(width, height) / 2
          body = Bodies.circle(x, y, radius, {
            ...props.matterBodyOptions,
            angle: angle,
            render: {
              fillStyle: debug ? "#888888" : "#00000000",
              strokeStyle: debug ? "#333333" : "#00000000",
              lineWidth: debug ? 3 : 0,
            },
          })
        } else if (props.bodyType === "svg") {
          const paths = element.querySelectorAll("path")
          const vertexSets: Matter.Vector[][] = []

          paths.forEach((path) => {
            const d = path.getAttribute("d")
            const p = parsePathToVertices(d!, props.sampleLength)
            vertexSets.push(p)
          })

          body = Bodies.fromVertices(x, y, vertexSets, {
            ...props.matterBodyOptions,
            angle: angle,
            render: {
              fillStyle: debug ? "#888888" : "#00000000",
              strokeStyle: debug ? "#333333" : "#00000000",
              lineWidth: debug ? 3 : 0,
            },
          })
        } else {
          body = Bodies.rectangle(x, y, width, height, {
            ...props.matterBodyOptions,
            angle: angle,
            render: {
              fillStyle: debug ? "#888888" : "#00000000",
              strokeStyle: debug ? "#333333" : "#00000000",
              lineWidth: debug ? 3 : 0,
            },
          })
        }

        if (body) {
          World.add(engine.current.world, [body])
          bodiesMap.current.set(id, { element, body, props })
        }
      },
      [debug]
    )

    // Unregister Matter.js body from the physics world
    const unregisterElement = useCallback((id: string) => {
      const body = bodiesMap.current.get(id)
      if (body) {
        World.remove(engine.current.world, body.body)
        bodiesMap.current.delete(id)
      }
    }, [])

    // Keep react elements in sync with the physics world
    const updateElements = useCallback(() => {
      bodiesMap.current.forEach(({ element, body }) => {
        const { x, y } = body.position
        const rotation = body.angle * (180 / Math.PI)

        element.style.transform = `translate(${
          x - element.offsetWidth / 2
        }px, ${y - element.offsetHeight / 2}px) rotate(${rotation}deg)`
      })

      frameId.current = requestAnimationFrame(updateElements)
    }, [])

    const initializeRenderer = useCallback(() => {
      if (!canvas.current || initialized.current) return
      initialized.current = true

      const height = canvas.current.offsetHeight
      const width = canvas.current.offsetWidth

      Common.setDecomp(require("poly-decomp"))

      engine.current.gravity.x = gravity.x
      engine.current.gravity.y = gravity.y

      render.current = Render.create({
        element: canvas.current,
        engine: engine.current,
        options: {
          width,
          height,
          wireframes: false,
          background: "#00000000",
          showVelocity: false,
          showAngleIndicator: false,
          showDebug: false,
        },
      })

      // Make canvas non-interactive so React elements can receive events
      if (render.current.canvas) {
        render.current.canvas.style.pointerEvents = 'none'
        render.current.canvas.style.position = 'absolute'
        render.current.canvas.style.top = '0'
        render.current.canvas.style.left = '0'
        render.current.canvas.style.zIndex = '1'
      }

      const mouse = Mouse.create(render.current.canvas)
      mouseConstraint.current = MouseConstraint.create(engine.current, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: debug,
          },
        },
      })

      // Add walls
      const walls = [
        // Floor
        Bodies.rectangle(width / 2, height + 10, width, 20, {
          isStatic: true,
          friction: 1,
          render: {
            visible: debug,
          },
        }),

        // Right wall
        Bodies.rectangle(width + 10, height / 2, 20, height, {
          isStatic: true,
          friction: 1,
          render: {
            visible: debug,
          },
        }),

        // Left wall
        Bodies.rectangle(-10, height / 2, 20, height, {
          isStatic: true,
          friction: 1,
          render: {
            visible: debug,
          },
        }),
      ]

      const topWall = addTopWall
        ? Bodies.rectangle(width / 2, -10, width, 20, {
            isStatic: true,
            friction: 1,
            render: {
              visible: debug,
            },
          })
        : null

      if (topWall) {
        walls.push(topWall)
      }

      const touchingMouse = () =>
        Query.point(
          engine.current.world.bodies,
          mouseConstraint.current?.mouse.position || { x: 0, y: 0 }
        ).length > 0

      if (grabCursor) {
        Events.on(engine.current, "beforeUpdate", (event) => {
          if (canvas.current) {
            if (!mouseDown.current && !touchingMouse()) {
              canvas.current.style.cursor = "default"
            } else if (touchingMouse()) {
              canvas.current.style.cursor = mouseDown.current
                ? "grabbing"
                : "grab"
            }
          }
        })

        canvas.current.addEventListener("mousedown", (event) => {
          mouseDown.current = true

          if (canvas.current) {
            if (touchingMouse()) {
              canvas.current.style.cursor = "grabbing"
            } else {
              canvas.current.style.cursor = "default"
            }
          }
        })
        canvas.current.addEventListener("mouseup", (event) => {
          mouseDown.current = false

          if (canvas.current) {
            if (touchingMouse()) {
              canvas.current.style.cursor = "grab"
            } else {
              canvas.current.style.cursor = "default"
            }
          }
        })
      }

      World.add(engine.current.world, [mouseConstraint.current, ...walls])

      render.current.mouse = mouse

      runner.current = Runner.create()
      Render.run(render.current)
      updateElements()
      runner.current.enabled = false

      if (autoStart) {
        runner.current.enabled = true
        startEngine()
      }
    }, [])

    // Clear the Matter.js world
    const clearRenderer = useCallback(() => {
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }

      if (mouseConstraint.current) {
        World.remove(engine.current.world, mouseConstraint.current)
      }

      if (render.current) {
        Mouse.clearSourceEvents(render.current.mouse)
        Render.stop(render.current)
        render.current.canvas.remove()
      }

      if (runner.current) {
        Runner.stop(runner.current)
      }

      if (engine.current) {
        World.clear(engine.current.world, false)
        Engine.clear(engine.current)
      }

      bodiesMap.current.clear()
      initialized.current = false
    }, [])

    const startEngine = useCallback(() => {
      if (runner.current) {
        runner.current.enabled = true
        Runner.run(runner.current, engine.current)
      }
      if (render.current) {
        Render.run(render.current)
      }
      frameId.current = requestAnimationFrame(updateElements)
      isRunning.current = true
    }, [updateElements])

    const stopEngine = useCallback(() => {
      if (!isRunning.current) return

      if (runner.current) {
        Runner.stop(runner.current)
      }
      if (render.current) {
        Render.stop(render.current)
      }
      if (frameId.current) {
        cancelAnimationFrame(frameId.current)
      }
      isRunning.current = false
    }, [])

    const reset = useCallback(() => {
      // Don't reset on re-renders
      return
    }, [])

    useImperativeHandle(
      ref,
      () => ({
        start: startEngine,
        stop: stopEngine,
        reset,
      }),
      [startEngine, stopEngine, reset]
    )

    // Initialize only once
    useEffect(() => {
      if (!initialized.current) {
        initializeRenderer()
      }
      return clearRenderer
    }, [])

    return (
      <GravityContext.Provider value={{ registerElement, unregisterElement, bodiesMap: bodiesMap.current }}>
        <div
          ref={canvas}
          className={cn(className, "absolute top-0 left-0 w-full h-full pointer-events-auto")}
          style={{ zIndex: 10 }}
          {...props}
        >
          {children}
        </div>
      </GravityContext.Provider>
    )
  }
))

Gravity.displayName = "Gravity"
export { Gravity, MatterBody }
