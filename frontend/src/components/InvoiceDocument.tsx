import React from 'react';
import { Bill } from '../types';
import { WatermarkLogo } from './WatermarkLogo';
import { formatBillNo } from '../utils/format';

interface InvoiceDocumentProps {
  bill: Bill;
}

const FONT_TEXT = "'Bookman Old Style', 'Bookman', 'URW Bookman L', 'Palatino Linotype', 'Georgia', serif";
const FONT_NUMERIC = "'Arial', 'Helvetica Neue', Helvetica, sans-serif";

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
      className="invoice-document font-text"
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
        fontFamily: FONT_TEXT,
        color: '#1a237e',
        lineHeight: 1.3,
        fontSize: '12px',
      }}
    >
      {/* Background Watermark */}
      <WatermarkLogo />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Top Header Section - "BILL" */}
        <div
          className="font-text"
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '13px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            borderBottom: '1.5px solid #1a237e',
            paddingBottom: '2px',
            fontFamily: FONT_TEXT,
          }}
        >
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
            <span className="font-text" style={{ fontSize: '13px', fontWeight: 'bold', display: 'block', fontFamily: FONT_TEXT }}>BILL</span>
            <span className="font-text" style={{ fontSize: '17px', fontWeight: 900, fontFamily: FONT_TEXT }}>
              No: <span className="font-numeric" style={{ fontFamily: FONT_NUMERIC }}>{formatBillNo(bill.bill_no)}</span>
            </span>
          </div>

          {/* Garage Name & Subtitle */}
          <div style={{ textAlign: 'center', padding: '6px 8px' }}>
            <h1 className="font-text" style={{
              fontSize: '32px',
              fontWeight: 900,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              margin: 0,
              fontFamily: FONT_TEXT,
            }}>
              VICKY'S GARAGE
            </h1>
            <p className="font-text" style={{
              fontSize: '11px',
              fontWeight: 'bold',
              fontStyle: 'italic',
              letterSpacing: '1px',
              marginTop: '2px',
              fontFamily: FONT_TEXT,
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
            <p className="font-text" style={{ fontSize: '13px', fontWeight: 'bold', margin: '0 0 2px 0', fontFamily: FONT_TEXT }}>U.Vignesh Kumar</p>
            <p className="font-text" style={{ fontSize: '13px', fontWeight: 'bold', margin: 0, fontFamily: FONT_TEXT }}>
              📞 <span className="font-numeric" style={{ fontFamily: FONT_NUMERIC }}>+91 99417 49495</span>
            </p>
          </div>
        </div>

        {/* Address Line */}
        <div className="font-text" style={{
          borderBottom: '2px solid #1a237e',
          padding: '3px 0',
          textAlign: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontFamily: FONT_TEXT,
        }}>
          Old No: <span className="font-numeric" style={{ fontFamily: FONT_NUMERIC }}>22/2</span>, New No: <span className="font-numeric" style={{ fontFamily: FONT_NUMERIC }}>53/2</span>, Gangaiamman Koil Street, Choolaimedu, Chennai - <span className="font-numeric" style={{ fontFamily: FONT_NUMERIC }}>600094</span>
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
            <span className="font-text" style={{ width: '80px', fontWeight: 'bold', flexShrink: 0, fontFamily: FONT_TEXT }}>To:</span>
            <span className="font-text" style={{ fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', fontFamily: FONT_TEXT }}>{toName}</span>
          </div>
          <div style={{
            borderBottom: '1px solid #1a237e',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
          }}>
            <span className="font-text" style={{ width: '50px', fontWeight: 'bold', flexShrink: 0, fontFamily: FONT_TEXT }}>Date:</span>
            <span className="font-numeric" style={{ fontWeight: 900, fontFamily: FONT_NUMERIC }}>{formatDate(bill.bill_date)}</span>
          </div>

          {/* Row 2: Vehicle No & KM */}
          <div style={{
            borderRight: '2px solid #1a237e',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
          }}>
            <span className="font-text" style={{ width: '80px', fontWeight: 'bold', flexShrink: 0, fontFamily: FONT_TEXT }}>Vehicle No:</span>
            <span className="font-numeric" style={{ fontWeight: 900, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: FONT_NUMERIC }}>
              {bill.vehicle_number}
            </span>
          </div>
          <div style={{
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
          }}>
            <span className="font-text" style={{ width: '50px', fontWeight: 'bold', flexShrink: 0, fontFamily: FONT_TEXT }}>KM:</span>
            <span className="font-numeric" style={{ fontWeight: 900, fontFamily: FONT_NUMERIC }}>{bill.km_driven !== '' ? bill.km_driven : '-'}</span>
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
              fontFamily: FONT_TEXT,
            }}>
              <th className="font-text" style={{ width: '42px', padding: '4px 2px', fontFamily: FONT_TEXT }}>S.No</th>
              <th className="font-text" style={{ padding: '4px 8px', textAlign: 'center', fontFamily: FONT_TEXT }}>PARTICULAR</th>
              <th className="font-text" style={{ width: '50px', padding: '4px 2px', fontFamily: FONT_TEXT }}>QTY</th>
              <th className="font-text" style={{ width: '140px', padding: '0', fontFamily: FONT_TEXT }}>
                <div className="font-text" style={{ borderBottom: '1px solid #1a237e', padding: '2px 4px', fontFamily: FONT_TEXT }}>AMOUNT</div>
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', fontSize: '10px', fontWeight: 'bold', padding: '2px 4px', fontFamily: FONT_TEXT }}>
                  <span className="font-text" style={{ textAlign: 'right', paddingRight: '6px', fontFamily: FONT_TEXT }}>Rs.</span>
                  <span className="font-text" style={{ textAlign: 'center', fontFamily: FONT_TEXT }}>Ps.</span>
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
                  <td className="font-numeric" style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px', verticalAlign: 'middle', fontFamily: FONT_NUMERIC }}>{sNo}</td>
                  <td className="font-text" style={{
                    padding: '0 8px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '11px',
                    verticalAlign: 'middle',
                    maxWidth: '280px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontFamily: FONT_TEXT,
                  }}>
                    {item ? item.product_name : ''}
                  </td>
                  <td className="font-numeric" style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '11px', verticalAlign: 'middle', fontFamily: FONT_NUMERIC }}>
                    {item && item.qty !== '' ? item.qty : ''}
                  </td>
                  <td style={{ verticalAlign: 'middle', padding: 0 }}>
                    <div className="font-numeric" style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', fontWeight: 'bold', fontSize: '11px', height: '100%', alignItems: 'center', fontFamily: FONT_NUMERIC }}>
                      <span className="font-numeric" style={{ textAlign: 'right', paddingRight: '6px', fontFamily: FONT_NUMERIC }}>{rsPs.rs}</span>
                      <span className="font-numeric" style={{ textAlign: 'center', borderLeft: '1px solid #94a3b8', fontFamily: FONT_NUMERIC }}>{rsPs.ps}</span>
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
          {/* Left: Labels (Bookman Old Style) */}
          <div className="font-text" style={{ borderRight: '2px solid #1a237e', fontFamily: FONT_TEXT }}>
            <div className="font-text" style={{ borderBottom: '1px solid #1a237e', padding: '4px 8px', textTransform: 'uppercase', fontWeight: 900 }}>
              TOTAL
            </div>
            <div className="font-text" style={{ borderBottom: '1px solid #1a237e', padding: '4px 8px', textTransform: 'uppercase', fontWeight: 900 }}>
              ADVANCE
            </div>
            <div className="font-text" style={{ padding: '4px 8px', textTransform: 'uppercase', fontWeight: 900 }}>
              BALANCE
            </div>
          </div>

          {/* Right: Amounts (Arial, Bold) */}
          <div className="font-numeric" style={{ fontFamily: FONT_NUMERIC }}>
            <div className="font-numeric" style={{ borderBottom: '1px solid #1a237e', padding: '4px 8px', textAlign: 'right', fontWeight: 900, fontSize: '13px', fontFamily: FONT_NUMERIC }}>
              {totalRsPs.rs}{totalRsPs.ps && <span className="font-numeric" style={{ fontSize: '11px', fontFamily: FONT_NUMERIC }}>.{totalRsPs.ps}</span>}
            </div>
            <div className="font-numeric" style={{ borderBottom: '1px solid #1a237e', padding: '4px 8px', textAlign: 'right', fontWeight: 900, fontSize: '13px', fontFamily: FONT_NUMERIC }}>
              {advanceRsPs.rs ? `${advanceRsPs.rs}.${advanceRsPs.ps}` : '-'}
            </div>
            <div className="font-numeric" style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 900, fontSize: '13px', fontFamily: FONT_NUMERIC }}>
              {balanceRsPs.rs}{balanceRsPs.ps && <span className="font-numeric" style={{ fontSize: '11px', fontFamily: FONT_NUMERIC }}>.{balanceRsPs.ps}</span>}
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
            <span className="font-text" style={{
              fontWeight: 900,
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '3px',
              fontSize: '12px',
              fontFamily: FONT_TEXT,
            }}>
              COMPLAINT
            </span>
            <p className="font-text" style={{
              fontSize: '11px',
              fontWeight: 'normal',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.4,
              margin: 0,
              fontFamily: FONT_TEXT,
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
            <div className="font-text" style={{
              fontWeight: 900,
              textTransform: 'uppercase',
              fontSize: '12px',
              letterSpacing: '1px',
              fontFamily: FONT_TEXT,
            }}>
              For VICKY'S GARAGE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

