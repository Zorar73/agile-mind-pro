// src/utils/certificateGenerator.js
// Генерация PDF сертификатов
// Требует: npm install jspdf

/**
 * Генерирует PDF сертификат о прохождении курса
 * @param {Object} userData - данные пользователя { firstName, lastName, displayName }
 * @param {Object} courseData - данные курса { title }
 * @param {Object} certificate - данные сертификата { certificateNumber, verificationCode, completedAt }
 * @returns {Promise<Blob>} - PDF blob для скачивания
 */
export async function generateCertificatePDF(userData, courseData, certificate) {
  // Динамический импорт jsPDF
  const { jsPDF } = await import('jspdf');
  
  // Создаем документ A4 горизонтальный
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Цвета
  const primaryColor = [30, 136, 229]; // #1E88E5
  const goldColor = [255, 193, 7]; // #FFC107
  const darkColor = [33, 33, 33]; // #212121
  const grayColor = [117, 117, 117]; // #757575

  // Фон - градиент имитация через прямоугольники
  doc.setFillColor(248, 249, 250);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Декоративная рамка
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(3);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
  
  // Внутренняя рамка
  doc.setLineWidth(0.5);
  doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

  // Декоративные углы
  const cornerSize = 20;
  doc.setFillColor(...goldColor);
  
  // Верхний левый угол
  doc.triangle(10, 10, 10 + cornerSize, 10, 10, 10 + cornerSize, 'F');
  // Верхний правый угол
  doc.triangle(pageWidth - 10, 10, pageWidth - 10 - cornerSize, 10, pageWidth - 10, 10 + cornerSize, 'F');
  // Нижний левый угол
  doc.triangle(10, pageHeight - 10, 10 + cornerSize, pageHeight - 10, 10, pageHeight - 10 - cornerSize, 'F');
  // Нижний правый угол
  doc.triangle(pageWidth - 10, pageHeight - 10, pageWidth - 10 - cornerSize, pageHeight - 10, pageWidth - 10, pageHeight - 10 - cornerSize, 'F');

  // Заголовок "СЕРТИФИКАТ"
  doc.setTextColor(...primaryColor);
  doc.setFontSize(42);
  doc.setFont('helvetica', 'bold');
  doc.text('СЕРТИФИКАТ', pageWidth / 2, 45, { align: 'center' });

  // Подзаголовок
  doc.setTextColor(...grayColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('О ПРОХОЖДЕНИИ КУРСА', pageWidth / 2, 55, { align: 'center' });

  // Декоративная линия
  doc.setDrawColor(...goldColor);
  doc.setLineWidth(1);
  doc.line(pageWidth / 2 - 50, 62, pageWidth / 2 + 50, 62);

  // "Настоящим подтверждается, что"
  doc.setTextColor(...darkColor);
  doc.setFontSize(12);
  doc.text('Настоящим подтверждается, что', pageWidth / 2, 80, { align: 'center' });

  // Имя пользователя
  const userName = userData.displayName || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Участник';
  doc.setTextColor(...primaryColor);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(userName, pageWidth / 2, 95, { align: 'center' });

  // Линия под именем
  const nameWidth = doc.getTextWidth(userName);
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(pageWidth / 2 - nameWidth / 2 - 10, 100, pageWidth / 2 + nameWidth / 2 + 10, 100);

  // "успешно завершил(а) курс"
  doc.setTextColor(...darkColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('успешно завершил(а) курс', pageWidth / 2, 115, { align: 'center' });

  // Название курса
  doc.setTextColor(...darkColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  
  // Разбиваем название курса на строки если слишком длинное
  const courseTitle = courseData.title || 'Курс';
  const maxWidth = pageWidth - 80;
  const splitTitle = doc.splitTextToSize(courseTitle, maxWidth);
  doc.text(splitTitle, pageWidth / 2, 130, { align: 'center' });

  // Рассчитываем позицию после названия курса
  const titleHeight = splitTitle.length * 8;
  const afterTitleY = 130 + titleHeight;

  // Дата завершения
  const completionDate = certificate.completedAt instanceof Date 
    ? certificate.completedAt 
    : certificate.completedAt?.toDate?.() || new Date();
  
  const dateStr = completionDate.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  doc.setTextColor(...grayColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Дата выдачи: ${dateStr}`, pageWidth / 2, afterTitleY + 15, { align: 'center' });

  // Номер сертификата и код верификации
  doc.setFontSize(9);
  doc.text(`Номер сертификата: ${certificate.certificateNumber}`, pageWidth / 2, pageHeight - 35, { align: 'center' });
  doc.text(`Код верификации: ${certificate.verificationCode}`, pageWidth / 2, pageHeight - 28, { align: 'center' });

  // Футер
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('Agile Mind Pro — Система управления обучением', pageWidth / 2, pageHeight - 18, { align: 'center' });

  // Возвращаем blob
  return doc.output('blob');
}

/**
 * Скачивает сертификат как PDF файл
 * @param {Object} userData - данные пользователя
 * @param {Object} courseData - данные курса
 * @param {Object} certificate - данные сертификата
 */
export async function downloadCertificatePDF(userData, courseData, certificate) {
  try {
    const blob = await generateCertificatePDF(userData, courseData, certificate);
    
    // Создаем ссылку для скачивания
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate_${certificate.certificateNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('Error downloading certificate:', error);
    return { success: false, error: error.message };
  }
}

export default {
  generateCertificatePDF,
  downloadCertificatePDF,
};
