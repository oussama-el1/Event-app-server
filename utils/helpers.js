const crypto = require('crypto');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;
const Ticket = require('../models/Tickets');

async function generateUniqueBookingId() {
  let bookingId;
  let isUnique = false;

  do {
    bookingId = crypto.randomBytes(4).toString('hex').toUpperCase();
    const existingTicket = await Ticket.findOne({ bookingId });
    if (!existingTicket) {
      isUnique = true;
    }
  } while (!isUnique);

  return bookingId;
};

const generateQRCode = async (data) => {
  const qrCodeDir = path.resolve('/tmp/event-app/tickets');
  const qrCodePath = path.join(qrCodeDir, `${data.ticketId}.png`);

  try {
    await fs.mkdir(qrCodeDir, { recursive: true });
  } catch (err) {
    console.error(`Failed to create directory ${qrCodeDir}:`, err);
    throw err;
  }

  const qrCodeData = JSON.stringify(data);

  await QRCode.toFile(qrCodePath, qrCodeData, {
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  return qrCodePath;
};

module.exports = {
  generateUniqueBookingId,
  generateQRCode,
};
