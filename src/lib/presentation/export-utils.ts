import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import pptxgen from 'pptxgenjs';
import JSZip from 'jszip';
import { type PlateSlide } from '@/components/presentation/utils/parser';

/**
 * Exporta a apresentação como PDF
 * @param slides Array de slides da apresentação
 * @param title Título da apresentação
 */
export async function exportToPdf(
  slides: PlateSlide[],
  title: string,
  slideElements: HTMLElement[]
): Promise<void> {
  try {
    // Criar um novo documento PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Definir o título do documento
    pdf.setProperties({
      title: title || 'Apresentação',
    });

    // Para cada slide, capturar a imagem e adicionar ao PDF
    for (let i = 0; i < slideElements.length; i++) {
      const slideElement = slideElements[i];
      
      if (!slideElement) continue;
      
      // Adicionar uma espera para garantir que o slide esteja completamente renderizado
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log(`Exportando slide ${i + 1}/${slideElements.length}`);
      
      // Capturar o slide como uma imagem com melhor qualidade
      const canvas = await html2canvas(slideElement, {
        scale: 3, // Escala para melhor qualidade
        useCORS: true, // Permitir imagens de outros domínios
        logging: true, // Ativar logs para depuração
        allowTaint: true, // Permitir conteúdo de outros domínios
        backgroundColor: slideElement.style.backgroundColor || '#ffffff', // Usar a cor de fundo do slide ou branco como padrão
        imageTimeout: 0, // Sem timeout para carregamento de imagens
        onclone: (clonedDoc, clonedElement) => {
          console.log('Clonando slide para exportação');
          
          // Ajustar dimensões para melhor qualidade
          clonedElement.style.width = '1400px';
          clonedElement.style.height = '900px';
          
          // Preservar fontes e cores dos títulos
          try {
            // Selecionar todos os títulos e elementos com classes relacionadas a títulos
            const headings = clonedElement.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="heading"]');
            
            headings.forEach(heading => {
              // Obter os estilos computados (incluindo os definidos via CSS)
              const computedStyle = window.getComputedStyle(heading as Element);
              const h = heading as HTMLElement;
              
              // Aplicar cores e fontes dos estilos computados
              h.style.color = computedStyle.color;
              h.style.fontFamily = computedStyle.fontFamily;
              h.style.fontSize = computedStyle.fontSize;
              h.style.fontWeight = computedStyle.fontWeight;
              
              // Melhorar a nitidez do texto
              h.style.textRendering = 'optimizeLegibility';
              (h.style as any)['-webkit-font-smoothing'] = 'antialiased';
              (h.style as any)['-moz-osx-font-smoothing'] = 'grayscale';
              h.style.textShadow = 'none'; // Remover sombras que podem causar borrão
            });
            
            // Também processar elementos com cores específicas (como os retângulos coloridos)
            const coloredElements = clonedElement.querySelectorAll('[style*="background"], [style*="color"]');
            coloredElements.forEach(element => {
              const computedStyle = window.getComputedStyle(element as Element);
              const el = element as HTMLElement;
              
              if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                el.style.backgroundColor = computedStyle.backgroundColor;
              }
              
              if (computedStyle.color) {
                el.style.color = computedStyle.color;
              }
            });
          } catch (e) {
            console.error('Erro ao processar títulos:', e);
          }
        }
      });
      
      // Converter o canvas para uma imagem
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Adicionar a imagem ao PDF
      if (i > 0) {
        pdf.addPage();
      }
      
      // Ajustar a imagem para caber na página
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
    }
    
    // Salvar o PDF
    pdf.save(`${title || 'apresentacao'}.pdf`);
  } catch (error) {
    console.error('Erro ao exportar para PDF:', error);
    throw new Error('Não foi possível exportar para PDF');
  }
}

/**
 * Exporta a apresentação como PowerPoint
 * @param slides Array de slides da apresentação
 * @param title Título da apresentação
 */
export async function exportToPowerPoint(
  slides: PlateSlide[],
  title: string,
  slideElements: HTMLElement[]
): Promise<void> {
  try {
    // Criar uma nova apresentação PowerPoint
    const pptx = new pptxgen();
    
    // Definir o título da apresentação
    pptx.title = title || 'Apresentação';
    
    // Para cada slide, capturar a imagem e adicionar ao PowerPoint
    for (let i = 0; i < slideElements.length; i++) {
      const slideElement = slideElements[i];
      
      if (!slideElement) continue;
      
      // Adicionar uma espera para garantir que o slide esteja completamente renderizado
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log(`Exportando slide ${i + 1}/${slideElements.length}`);
      
      // Capturar o slide como uma imagem com melhor qualidade
      const canvas = await html2canvas(slideElement, {
        scale: 3, // Escala para melhor qualidade
        useCORS: true, // Permitir imagens de outros domínios
        logging: true, // Ativar logs para depuração
        allowTaint: true, // Permitir conteúdo de outros domínios
        backgroundColor: slideElement.style.backgroundColor || '#ffffff', // Usar a cor de fundo do slide ou branco como padrão
        imageTimeout: 0, // Sem timeout para carregamento de imagens
        onclone: (clonedDoc, clonedElement) => {
          console.log('Clonando slide para exportação');
          
          // Ajustar dimensões para melhor qualidade
          clonedElement.style.width = '1400px';
          clonedElement.style.height = '900px';
          
          // Preservar fontes e cores dos títulos
          try {
            // Selecionar todos os títulos e elementos com classes relacionadas a títulos
            const headings = clonedElement.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="heading"]');
            
            headings.forEach(heading => {
              // Obter os estilos computados (incluindo os definidos via CSS)
              const computedStyle = window.getComputedStyle(heading as Element);
              const h = heading as HTMLElement;
              
              // Aplicar cores e fontes dos estilos computados
              h.style.color = computedStyle.color;
              h.style.fontFamily = computedStyle.fontFamily;
              h.style.fontSize = computedStyle.fontSize;
              h.style.fontWeight = computedStyle.fontWeight;
              
              // Melhorar a nitidez do texto
              h.style.textRendering = 'optimizeLegibility';
              (h.style as any)['-webkit-font-smoothing'] = 'antialiased';
              (h.style as any)['-moz-osx-font-smoothing'] = 'grayscale';
              h.style.textShadow = 'none'; // Remover sombras que podem causar borrão
            });
            
            // Também processar elementos com cores específicas (como os retângulos coloridos)
            const coloredElements = clonedElement.querySelectorAll('[style*="background"], [style*="color"]');
            coloredElements.forEach(element => {
              const computedStyle = window.getComputedStyle(element as Element);
              const el = element as HTMLElement;
              
              if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                el.style.backgroundColor = computedStyle.backgroundColor;
              }
              
              if (computedStyle.color) {
                el.style.color = computedStyle.color;
              }
            });
          } catch (e) {
            console.error('Erro ao processar títulos:', e);
          }
        }
      });
      
      // Converter o canvas para uma imagem
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      // Adicionar um novo slide
      const slide = pptx.addSlide();
      
      // Adicionar a imagem ao slide
      slide.addImage({
        data: imgData,
        x: 0,
        y: 0,
        w: '100%',
        h: '100%',
      });
    }
    
    // Salvar a apresentação PowerPoint
    pptx.writeFile({ fileName: `${title || 'apresentacao'}.pptx` });
  } catch (error) {
    console.error('Erro ao exportar para PowerPoint:', error);
    throw new Error('Não foi possível exportar para PowerPoint');
  }
}

/**
 * Exporta a apresentação como imagens PNG
 * @param slides Array de slides da apresentação
 * @param title Título da apresentação
 */
export async function exportToPng(
  slides: PlateSlide[],
  title: string,
  slideElements: HTMLElement[]
): Promise<void> {
  try {
    // Criar um novo arquivo ZIP
    const zip = new JSZip();
    
    // Para cada slide, capturar a imagem e adicionar ao ZIP
    for (let i = 0; i < slideElements.length; i++) {
      const slideElement = slideElements[i];
      
      if (!slideElement) continue;
      
      // Adicionar uma espera para garantir que o slide esteja completamente renderizado
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log(`Exportando slide ${i + 1}/${slideElements.length}`);
      
      // Capturar o slide como uma imagem com melhor qualidade
      const canvas = await html2canvas(slideElement, {
        scale: 3, // Escala para melhor qualidade
        useCORS: true, // Permitir imagens de outros domínios
        logging: true, // Ativar logs para depuração
        allowTaint: true, // Permitir conteúdo de outros domínios
        backgroundColor: slideElement.style.backgroundColor || '#ffffff', // Usar a cor de fundo do slide ou branco como padrão
        imageTimeout: 0, // Sem timeout para carregamento de imagens
        onclone: (clonedDoc, clonedElement) => {
          console.log('Clonando slide para exportação');
          
          // Ajustar dimensões para melhor qualidade
          clonedElement.style.width = '1400px';
          clonedElement.style.height = '900px';
          
          // Preservar fontes e cores dos títulos
          try {
            // Selecionar todos os títulos e elementos com classes relacionadas a títulos
            const headings = clonedElement.querySelectorAll('h1, h2, h3, h4, h5, h6, [class*="title"], [class*="heading"]');
            
            headings.forEach(heading => {
              // Obter os estilos computados (incluindo os definidos via CSS)
              const computedStyle = window.getComputedStyle(heading as Element);
              const h = heading as HTMLElement;
              
              // Aplicar cores e fontes dos estilos computados
              h.style.color = computedStyle.color;
              h.style.fontFamily = computedStyle.fontFamily;
              h.style.fontSize = computedStyle.fontSize;
              h.style.fontWeight = computedStyle.fontWeight;
              
              // Melhorar a nitidez do texto
              h.style.textRendering = 'optimizeLegibility';
              (h.style as any)['-webkit-font-smoothing'] = 'antialiased';
              (h.style as any)['-moz-osx-font-smoothing'] = 'grayscale';
              h.style.textShadow = 'none'; // Remover sombras que podem causar borrão
            });
            
            // Também processar elementos com cores específicas (como os retângulos coloridos)
            const coloredElements = clonedElement.querySelectorAll('[style*="background"], [style*="color"]');
            coloredElements.forEach(element => {
              const computedStyle = window.getComputedStyle(element as Element);
              const el = element as HTMLElement;
              
              if (computedStyle.backgroundColor && computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                el.style.backgroundColor = computedStyle.backgroundColor;
              }
              
              if (computedStyle.color) {
                el.style.color = computedStyle.color;
              }
            });
          } catch (e) {
            console.error('Erro ao processar títulos:', e);
          }
        }
      });
      
      // Converter o canvas para uma imagem
      const imgData = canvas.toDataURL('image/png').replace('data:image/png;base64,', '');
      
      // Adicionar a imagem ao ZIP
      zip.file(`slide-${i + 1}.png`, imgData, { base64: true });
    }
    
    // Gerar o arquivo ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Salvar o arquivo ZIP
    saveAs(content, `${title || 'apresentacao'}-slides.zip`);
  } catch (error) {
    console.error('Erro ao exportar para PNG:', error);
    throw new Error('Não foi possível exportar para PNG');
  }
}
