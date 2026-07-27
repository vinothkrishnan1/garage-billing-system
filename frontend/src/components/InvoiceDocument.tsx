import React from 'react';
import { Bill } from '../types';
import { WatermarkLogo } from './WatermarkLogo';
import { formatBillNo } from '../utils/format';

interface InvoiceDocumentProps {
  bill: Bill;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ bill }) => {
  const items = bill.items || [];

  // Create 29 rows grid matching paper sample bill
  const maxRows = Math.max(29, items.length);
  const displayRows = Array.from({ length: maxRows });

  const formatAmount = (amt: number | '' | undefined) => {
    if (amt === '' || amt === undefined || isNaN(Number(amt))) return '';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(amt));
  };

  const getRsAndPs = (amt: number | '' | undefined) => {
    if (amt === '' || amt === undefined || isNaN(Number(amt)) || Number(amt) === 0) {
      return { rs: '', ps: '' };
    }
    const formatted = formatAmount(amt);
    const parts = formatted.split('.');
    return {
      rs: `₹ ${parts[0]}`,
      ps: parts[1] || '00'
    };
  };

  const totalRsPs = getRsAndPs(bill.total_amount);
  const advanceRsPs = getRsAndPs(bill.advance_amount);
  const balanceRsPs = getRsAndPs(bill.balance_amount);

  // "To" section: show Customer Name if available, else Vehicle Model
  const toName = bill.customer_name?.trim() || bill.vehicle_model?.trim() || 'CUSTOMER';

  // Format date as DD-MM-YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div
      id="printable-invoice"
      className="invoice-document"
      style={{
        width: '210mm',
        maxWidth: '210mm',
        minHeight: '297mm',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        padding: '3mm 4mm',
        border: '2px solid #1a237e',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
        color: '#1a237e',
        lineHeight: 1.3,
        fontSize: '12px',
      }}
    >
      {/* Background Watermark */}
      <WatermarkLogo />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Top Header Section - "BILL" */}
        <div style={{
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '13px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          borderBottom: '1.5px solid #1a237e',
          paddingBottom: '2px',
        }}>
          BILL
        </div>

        {/* Main Header Banner */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2.5fr 7fr 2.5fr',
          borderBottom: '2px solid #1a237e',
          alignItems: 'center',
        }}>
          {/* Bill No Box */}
          <div style={{
            borderRight: '2px solid #1a237e',
            padding: '6px 8px',
            textAlign: 'left',
          }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', display: 'block' }}>BILL</span>
            <span style={{ fontSize: '17px', fontWeight: 900 }}>No: {formatBillNo(bill.bill_no)}</span>
          </div>

          {/* Garage Name & Subtitle */}
          <div style={{ textAlign: 'center', padding: '6px 8px' }}>
            <h1 style={{
              fontSize: '26px',
              fontWeight: 900,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              margin: 0,
              fontFamily: "'Arial', 'Helvetica Neue', Helvetica, sans-serif",
            }}>
              VICKY'S GARAGE
            </h1>
            <p style={{
              fontSize: '11px',
              fontWeight: 'bold',
              fontStyle: 'italic',
              letterSpacing: '1px',
              marginTop: '2px',
            }}>
              Specialized in Royal Enfield
            </p>
          </div>

          {/* Contact Person Box */}
          <div style={{
            borderLeft: '2px solid #1a237e',
            padding: '6px 8px',
            textAlign: 'right',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 'bold', margin: '0 0 2px 0' }}>U.Vignesh Kumar</p>
            <p style={{ fontSize: '11px', fontWeight: 'bold', margin: 0 }}>
              📞 +91 98400 12345
            </p>
          </div>
        </div>

        {/* Address Line */}
        <div style={{
          borderBottom: '2px solid #1a237e',
          padding: '3px 0',
          textAlign: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        }}>
          Old No: 22/2, New No: 53/2, Gangaiamman Koil Street, Choolaimedu, Chennai - 600094
        </div>

        {/* Customer & Vehicle Information Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '2px solid #1a237e',
          fontSize: '12px',
          fontWeight: 'bold',
        }}>
          {/* Row 1: To & Date */}
          <div style={{
            borderRight: '2px solid #1a237e',
            borderBottom: '1px solid #1a237e',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
          }}>
            <span style={{ width: '80px', fontWeight: 'bold', flexShrink: 0 }}>To:</span>
            <span style={{ fontWeight: 900, fontSize: '13px', textTransform: 'uppercase' }}>{toName}</span>
          </div>
          <div style={{
            borderBottom: '1px solid #1a237e',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
          }}>
            <span style={{ width: '50px', fontWeight: 'bold', flexShrink: 0 }}>Date:</span>
            <span style={{ fontWeight: 900 }}>{formatDate(bill.bill_date)}</span>
          </div>

          {/* Row 2: Vehicle No & KM */}
          <div style={{
            borderRight: '2px solid #1a237e',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
          }}>
            <span style={{ width: '80px', fontWeight: 'bold', flexShrink: 0 }}>Vehicle No:</span>
            <span style={{ fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {bill.vehicle_number}
            </span>
          </div>
          <div style={{
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
          }}>
            <span style={{ width: '50px', fontWeight: 'bold', flexShrink: 0 }}>KM:</span>
            <span style={{ fontWeight: 900 }}>{bill.km_driven !== '' ? bill.km_driven : '-'}</span>
          </div>
        </div>

        {/* Particulars Grid Table */}
        <table style={{
          width: '100%',
          fontSize: '11px',
          borderCollapse: 'collapse',
          borderBottom: '2px solid #1a237e',
        }} className="bill-table-grid">
          <thead>
            <tr style={{
              fontWeight: 900,
              textAlign: 'center',
              textTransform: 'uppercase',
              borderBottom: '2px solid #1a237e',
              fontSize: '11px',
            }}>
              <th style={{ width: '42px', padding: '4px 2px' }}>S.No</th>
              <th style={{ padding: '4px 8px', textAlign: 'left' }}>PARTICULAR</th>
              <th style={{ width: '50px', padding: '4px 2px' }}>QTY</th>
              <th style={{ width: '140px', padding: '0' }}>
                <div style={{ borderBottom: '1px solid #1a237e', padding: '2px 4px' }}>AMOUNT</div>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', fontSize: '10px', fontWeight: 'bold', padding: '2px 4px' }}>
                  <span style={{ textAlign: 'right', paddingRight: '6px' }}>Rs.</span>
                  <span style={{ textAlign: 'center' }}>Ps.</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((_, idx) => {
              const item = items[idx];
              const sNo = idx + 1;
              const rsPs = item ? getRsAndPs(item.amount) : { rs: '', ps: '' };

              return (
                <tr key={idx} style={{ height: '20px' }}>
                  <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px', verticalAlign: 'middle' }}>{sNo}</td>
                  <td style={{
                    padding: '0 8px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    verticalAlign: 'middle',
                    maxWidth: '280px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item ? item.product_name : ''}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px', verticalAlign: 'middle' }}>
                    {item && item.qty !== '' ? item.qty : ''}
                  </td>
                  <td style={{ verticalAlign: 'middle', padding: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', fontWeight: 'bold', fontSize: '11px', height: '100%', alignItems: 'center' }}>
                      <span style={{ textAlign: 'right', paddingRight: '6px' }}>{rsPs.rs}</span>
                      <span style={{ textAlign: 'center', borderLeft: '1px solid #94a3b8' }}>{rsPs.ps}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Footer & Totals Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          borderBottom: '2px solid #1a237e',
          fontSize: '13px',
          fontWeight: 'bold',
        }}>
          {/* Left: Labels */}
          <div style={{ borderRight: '2px solid #1a237e' }}>
            <div style={{ borderBottom: '1px solid #1a237e', padding: '4px 8px', textTransform: 'uppercase', fontWeight: 900 }}>
              TOTAL
            </div>
            <div style={{ borderBottom: '1px solid #1a237e', padding: '4px 8px', textTransform: 'uppercase', fontWeight: 900 }}>
              ADVANCE
            </div>
            <div style={{ padding: '4px 8px', textTransform: 'uppercase', fontWeight: 900 }}>
              BALANCE
            </div>
          </div>

          {/* Right: Amounts */}
          <div>
            <div style={{ borderBottom: '1px solid #1a237e', padding: '4px 8px', textAlign: 'right', fontWeight: 900, fontSize: '13px' }}>
              {totalRsPs.rs}{totalRsPs.ps && <span style={{ fontSize: '11px' }}>.{totalRsPs.ps}</span>}
            </div>
            <div style={{ borderBottom: '1px solid #1a237e', padding: '4px 8px', textAlign: 'right', fontWeight: 900, fontSize: '13px' }}>
              {advanceRsPs.rs ? `${advanceRsPs.rs}.${advanceRsPs.ps}` : '-'}
            </div>
            <div style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 900, fontSize: '13px' }}>
              {balanceRsPs.rs}{balanceRsPs.ps && <span style={{ fontSize: '11px' }}>.{balanceRsPs.ps}</span>}
            </div>
          </div>
        </div>

        {/* Bottom Complaint & Signature Block */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '7fr 5fr',
          minHeight: '70px',
          fontSize: '12px',
        }}>
          {/* Complaint Box */}
          <div style={{ borderRight: '2px solid #1a237e', padding: '6px 8px' }}>
            <span style={{
              fontWeight: 900,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '3px',
              fontSize: '12px',
            }}>
              COMPLAINT
            </span>
            <p style={{
              fontSize: '11px',
              fontWeight: 'normal',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.4,
              margin: 0,
            }}>
              {bill.complaint || 'NIL'}
            </p>
          </div>

          {/* Garage Signature Line */}
          <div style={{
            padding: '6px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            textAlign: 'right',
          }}>
            <div style={{
              fontWeight: 900,
              textTransform: 'uppercase',
              fontSize: '12px',
              letterSpacing: '1px',
            }}>
              For VICKY'S GARAGE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
