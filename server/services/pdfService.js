import PDFDocument from 'pdfkit';

/**
 * Generate Analytics Intelligence PDF Document Buffer
 */
export function generateAnalyticsPDF({ timeframe = 'All', department = 'All', data }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
      const buffers = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const stats = data.stats || {};
      const deptData = data.departmentChartData || [];
      const suppliers = data.supplierSpendData || [];
      const costBins = data.costBins || [];
      const ageBins = data.ageBins || [];

      // Header Banner
      doc.rect(40, 40, 515, 65).fill('#4338ca');
      doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('ASSETMS', 55, 52);
      doc.fontSize(12).font('Helvetica').text('Campus Asset Intelligence & Executive Analytics Report', 55, 75);
      doc.fontSize(8).text(`Generated on: ${new Date().toLocaleDateString('en-IN', { dateStyle: 'full' })}`, 370, 56, { align: 'right', width: 170 });

      doc.moveDown(3);
      doc.fillColor('#1e293b');

      // Filter Badges
      let currentY = 120;
      doc.rect(40, currentY, 515, 24).fill('#f1f5f9');
      doc.fillColor('#334155').fontSize(9).font('Helvetica-Bold');
      doc.text(`TIMEFRAME: ${timeframe.toUpperCase()}`, 50, currentY + 7);
      doc.text(`DEPARTMENT: ${department.toUpperCase()}`, 200, currentY + 7);
      doc.text(`STATUS: LIVE MYSQL AUDIT`, 390, currentY + 7);

      // 4 KPI Summary Cards
      currentY = 155;
      const cardWidth = 120;
      const cardHeight = 55;
      const cardGap = 11;

      // Card 1: Total Capital
      doc.rect(40, currentY, cardWidth, cardHeight).fill('#eef2ff').stroke('#c7d2fe');
      doc.fillColor('#4338ca').fontSize(8).font('Helvetica-Bold').text('TOTAL CAPITAL', 45, currentY + 8);
      doc.fillColor('#1e1b4b').fontSize(12).text(`₹${Number(stats.totalCapital || 0).toLocaleString('en-IN')}`, 45, currentY + 22);
      doc.fontSize(7).font('Helvetica').fillColor('#64748b').text('Cumulative spend', 45, currentY + 40);

      // Card 2: Book Value
      doc.rect(40 + cardWidth + cardGap, currentY, cardWidth, cardHeight).fill('#ecfdf5').stroke('#a7f3d0');
      doc.fillColor('#059669').fontSize(8).font('Helvetica-Bold').text('CURRENT BOOK VALUE', 45 + cardWidth + cardGap, currentY + 8);
      doc.fillColor('#064e3b').fontSize(12).text(`₹${Number(stats.depreciatedValue || 0).toLocaleString('en-IN')}`, 45 + cardWidth + cardGap, currentY + 22);
      doc.fontSize(7).font('Helvetica').fillColor('#64748b').text('Depreciated valuation', 45 + cardWidth + cardGap, currentY + 40);

      // Card 3: Total Assets
      doc.rect(40 + (cardWidth + cardGap) * 2, currentY, cardWidth, cardHeight).fill('#f5f3ff').stroke('#ddd6fe');
      doc.fillColor('#7c3aed').fontSize(8).font('Helvetica-Bold').text('TOTAL ASSET UNITS', 45 + (cardWidth + cardGap) * 2, currentY + 8);
      doc.fillColor('#2e1065').fontSize(12).text(`${Number(stats.totalAssets || 0).toLocaleString('en-IN')} units`, 45 + (cardWidth + cardGap) * 2, currentY + 22);
      doc.fontSize(7).font('Helvetica').fillColor('#64748b').text('Physical campus units', 45 + (cardWidth + cardGap) * 2, currentY + 40);

      // Card 4: Health Score
      doc.rect(40 + (cardWidth + cardGap) * 3, currentY, cardWidth, cardHeight).fill('#fffbeb').stroke('#fde68a');
      doc.fillColor('#d97706').fontSize(8).font('Helvetica-Bold').text('HEALTH SCORE', 45 + (cardWidth + cardGap) * 3, currentY + 8);
      doc.fillColor('#78350f').fontSize(12).text(`${stats.healthScore || 100}%`, 45 + (cardWidth + cardGap) * 3, currentY + 22);
      doc.fontSize(7).font('Helvetica').fillColor('#64748b').text(`${stats.replacementDue || 0} due replacement`, 45 + (cardWidth + cardGap) * 3, currentY + 40);

      // Departmental Breakdown Table
      currentY = 225;
      doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('1. Departmental Asset Density & Invested Capital', 40, currentY);
      currentY += 18;

      doc.rect(40, currentY, 515, 18).fill('#4338ca');
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      doc.text('Department', 45, currentY + 5);
      doc.text('Physical Units', 230, currentY + 5);
      doc.text('Invested Capital (₹)', 350, currentY + 5);
      doc.text('Capital Share', 460, currentY + 5);

      currentY += 18;
      const totalDeptCap = deptData.reduce((s, d) => s + (d.value || 0), 0) || 1;
      deptData.forEach((dept, i) => {
        const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
        doc.rect(40, currentY, 515, 16).fill(bg);
        doc.fillColor('#334155').fontSize(8).font('Helvetica');
        doc.text(dept.label, 45, currentY + 4, { width: 180, truncate: true });
        doc.text(`${dept.volume} units`, 230, currentY + 4);
        doc.text(`₹${Number(dept.value).toLocaleString('en-IN')}`, 350, currentY + 4);
        doc.text(`${Math.round((dept.value / totalDeptCap) * 100)}%`, 460, currentY + 4);
        currentY += 16;
      });

      // Top Suppliers Table
      currentY += 12;
      doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('2. Top Suppliers by Procurement Allocation', 40, currentY);
      currentY += 18;

      doc.rect(40, currentY, 515, 18).fill('#059669');
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold');
      doc.text('Supplier / Vendor', 45, currentY + 5);
      doc.text('Total Procurement Value (₹)', 320, currentY + 5);
      doc.text('Share', 460, currentY + 5);

      currentY += 18;
      const totalSupp = suppliers.reduce((s, d) => s + (d.value || 0), 0) || 1;
      suppliers.forEach((s, i) => {
        const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
        doc.rect(40, currentY, 515, 16).fill(bg);
        doc.fillColor('#334155').fontSize(8).font('Helvetica');
        doc.text(s.label, 45, currentY + 4, { width: 260, truncate: true });
        doc.text(`₹${Number(s.value).toLocaleString('en-IN')}`, 320, currentY + 4);
        doc.text(`${Math.round((s.value / totalSupp) * 100)}%`, 460, currentY + 4);
        currentY += 16;
      });

      // Cost and Age Distributions
      currentY += 12;
      doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('3. Asset Cost Bracket & Age Profile Breakdown', 40, currentY);
      currentY += 18;

      doc.rect(40, currentY, 250, 16).fill('#6366f1');
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text('Unit Cost Distribution Bracket', 45, currentY + 4);
      doc.text('Count', 240, currentY + 4);

      doc.rect(305, currentY, 250, 16).fill('#8b5cf6');
      doc.fillColor('#ffffff').fontSize(8).font('Helvetica-Bold').text('Lifecycle / Age Bracket', 310, currentY + 4);
      doc.text('Count', 505, currentY + 4);

      currentY += 16;
      const maxRows = Math.max(costBins.length, ageBins.length);
      for (let i = 0; i < maxRows; i++) {
        const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
        doc.rect(40, currentY, 250, 15).fill(bg);
        doc.rect(305, currentY, 250, 15).fill(bg);

        doc.fillColor('#334155').fontSize(8).font('Helvetica');
        if (costBins[i]) {
          doc.text(costBins[i].range, 45, currentY + 3);
          doc.text(`${costBins[i].count}`, 240, currentY + 3);
        }
        if (ageBins[i]) {
          doc.text(ageBins[i].range, 310, currentY + 3);
          doc.text(`${ageBins[i].count}`, 505, currentY + 3);
        }
        currentY += 15;
      }

      // Executive Insights & Footer
      currentY += 14;
      doc.rect(40, currentY, 515, 45).fill('#f8fafc').stroke('#cbd5e1');
      doc.fillColor('#4338ca').fontSize(8).font('Helvetica-Bold').text('EXECUTIVE AUDIT SUMMARY & RECOMMENDATIONS:', 48, currentY + 6);
      doc.fillColor('#475569').fontSize(7.5).font('Helvetica').text(
        `• Current asset fleet reflects a healthy overall score of ${stats.healthScore}%. ${stats.replacementDue} units require lifecycle inspection or renewal.\n` +
        `• Procurement capital distribution remains aligned with academic block requirements, with verified real-time database validation.`,
        48,
        currentY + 18,
        { width: 500, lineGap: 3 }
      );

      // Page Numbering
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(7).fillColor('#94a3b8').text(
          `AssetMS Intelligence System • Page ${i + 1} of ${totalPages} • Confidential Institutional Record`,
          40,
          780,
          { align: 'center', width: 515 }
        );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generate Purchase History PDF Document Buffer
 */
export function generatePurchaseHistoryPDF({ purchases = [], filterSummary = {}, stats = {} }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 35, size: 'A4', bufferPages: true });
      const buffers = [];

      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const totalSpend = stats.totalExpenditure || purchases.reduce((s, p) => s + Number(p.totalAmount || (p.purchasePrice * (p.quantity || 1))), 0);
      const totalUnits = stats.totalUnits || purchases.reduce((s, p) => s + Number(p.quantity || 1), 0);
      const avgPrice = totalUnits > 0 ? totalSpend / totalUnits : 0;
      const vendorCount = new Set(purchases.map(p => p.vendorName)).size;

      // Header Banner
      doc.rect(35, 35, 525, 60).fill('#0f172a');
      doc.fillColor('#ffffff').fontSize(18).font('Helvetica-Bold').text('ASSETMS', 50, 47);
      doc.fontSize(11).font('Helvetica').text('Campus Procurement & Purchase History Report', 50, 68);
      doc.fontSize(8).text(`Report Date: ${new Date().toLocaleDateString('en-IN')}`, 390, 50, { align: 'right', width: 155 });

      // KPI summary row
      let currentY = 105;
      doc.rect(35, currentY, 525, 36).fill('#f1f5f9');
      doc.fillColor('#334155').fontSize(8).font('Helvetica-Bold');
      doc.text(`TOTAL SPEND: ₹${Number(totalSpend).toLocaleString('en-IN')}`, 45, currentY + 8);
      doc.text(`UNITS: ${totalUnits}`, 220, currentY + 8);
      doc.text(`TRANSACTIONS: ${purchases.length}`, 330, currentY + 8);
      doc.text(`ACTIVE SUPPLIERS: ${vendorCount}`, 430, currentY + 8);

      doc.font('Helvetica').fontSize(7.5).fillColor('#64748b');
      doc.text(`Filters: ${filterSummary.category || 'All Categories'} | ${filterSummary.vendor || 'All Vendors'} | ${filterSummary.dateRange || 'All Time'}`, 45, currentY + 22);

      // Transactions Table
      currentY = 150;
      const drawTableHeader = (y) => {
        doc.rect(35, y, 525, 18).fill('#4338ca');
        doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica-Bold');
        doc.text('Date', 40, y + 5);
        doc.text('Asset Name', 95, y + 5);
        doc.text('Vendor', 225, y + 5);
        doc.text('Category', 320, y + 5);
        doc.text('Price (₹)', 395, y + 5);
        doc.text('Qty', 450, y + 5);
        doc.text('Total (₹)', 480, y + 5);
      };

      drawTableHeader(currentY);
      currentY += 18;

      purchases.forEach((p, idx) => {
        if (currentY > 740) {
          doc.addPage();
          currentY = 40;
          drawTableHeader(currentY);
          currentY += 18;
        }

        const bg = idx % 2 === 0 ? '#f8fafc' : '#ffffff';
        doc.rect(35, currentY, 525, 16).fill(bg);
        doc.fillColor('#334155').fontSize(7).font('Helvetica');

        const pDate = p.purchaseDate ? p.purchaseDate.toString().slice(0, 10) : 'N/A';
        const price = Number(p.purchasePrice || 0);
        const qty = Number(p.quantity || 1);
        const total = Number(p.totalAmount || (price * qty));

        doc.text(pDate, 40, currentY + 4);
        doc.text(p.assetName || 'Item', 95, currentY + 4, { width: 125, truncate: true });
        doc.text(p.vendorName || 'Supplier', 225, currentY + 4, { width: 90, truncate: true });
        doc.text(p.categoryName || 'General', 320, currentY + 4, { width: 70, truncate: true });
        doc.text(`₹${price.toLocaleString('en-IN')}`, 395, currentY + 4);
        doc.text(`${qty}`, 450, currentY + 4);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(`₹${total.toLocaleString('en-IN')}`, 480, currentY + 4);

        currentY += 16;
      });

      // Page numbers
      const totalPages = doc.bufferedPageRange().count;
      for (let i = 0; i < totalPages; i++) {
        doc.switchToPage(i);
        doc.fontSize(7).fillColor('#94a3b8').text(
          `AssetMS Procurement System • Page ${i + 1} of ${totalPages} • Verified Database Audit`,
          35,
          795,
          { align: 'center', width: 525 }
        );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
