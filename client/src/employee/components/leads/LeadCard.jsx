import React, { useState, useRef, useEffect } from 'react';
import styles from './LeadCard.module.css';

const LeadCard = ({ lead, onTypeChange, onDateChange, onStatusChange }) => {
    const [activePopover, setActivePopover] = useState(null);
    const popoverRef = useRef(null);
    const [dateInput, setDateInput] = useState('');
    const [timeInput, setTimeInput] = useState('');
    const [statusDraft, setStatusDraft] = useState(lead.status);
    const [errorMsg, setErrorMsg] = useState('');

    const getStatusColor = () => {
        if (lead.status === 'Closed') return styles.closed;
        if (lead.type === 'Hot') return styles.hot;
        if (lead.type === 'Warm') return styles.warm;
        return styles.cold;
    };
    
    // Close popover if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setActivePopover(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [popoverRef]);

    useEffect(() => {
        if (activePopover === 'time') {
            // Parse lead.date to fill inputs
            const dateObj = lead.date ? new Date(lead.date) : null;
            if (dateObj && !isNaN(dateObj)) {
                setDateInput(dateObj.toISOString().slice(0, 10).split('-').reverse().join('/'));
                // Format time as HH:MM AM/PM
                let hours = dateObj.getHours();
                let minutes = dateObj.getMinutes();
                let ampm = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12;
                hours = hours ? hours : 12;
                const strTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
                setTimeInput(strTime);
            } else {
                setDateInput('');
                setTimeInput('');
            }
        }
    }, [activePopover, lead.date]);

    useEffect(() => {
        if (activePopover === 'status') setStatusDraft(lead.status);
    }, [activePopover, lead.status]);

    const handleTypeSelect = (type) => {
        onTypeChange && onTypeChange(lead.id, type);
        setActivePopover(null);
    };

    const handleDateSave = () => {
        // Parse dateInput and timeInput to Date object
        let [dd, mm, yyyy] = dateInput.split(/[\/\-]/);
        if (yyyy && yyyy.length === 4) {
            // dd/mm/yyyy
        } else {
            // yyyy-mm-dd
            [yyyy, mm, dd] = dateInput.split('-');
        }
        let [time, ampm] = timeInput.split(' ');
        let [hh, min] = time ? time.split(':') : [0, 0];
        hh = parseInt(hh, 10);
        min = parseInt(min, 10);
        if (ampm && ampm.toUpperCase() === 'PM' && hh < 12) hh += 12;
        if (ampm && ampm.toUpperCase() === 'AM' && hh === 12) hh = 0;
        const jsDate = new Date(`${yyyy}-${mm}-${dd}T${String(hh).padStart(2, '0')}:${String(min).padStart(2, '0')}:00`);
        // Format as 'Month DD, YYYY, HH:MM AM/PM'
        const formatted = jsDate.toLocaleString('en-US', { year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true });
        console.log('handleDateSave called:', { id: lead.id, iso: jsDate.toISOString(), jsDate, formatted });
        onDateChange && onDateChange(lead.id, jsDate.toISOString(), jsDate);
        setActivePopover(null);
    };

    const handleStatusSave = () => {
        // Block closing if scheduledDate is in the future
        if (
            statusDraft === 'Closed' &&
            lead.scheduledDate &&
            new Date(lead.scheduledDate) > new Date()
        ) {
            setErrorMsg('👉 Lead cannot be closed while a call is scheduled.');
            setTimeout(() => setErrorMsg(''), 3000);
            return;
        }
        if (statusDraft !== lead.status) {
            onStatusChange && onStatusChange(lead.id, statusDraft);
        }
        setActivePopover(null);
    };

    return (
        <div className={
            `${styles.leadCard} ` +
            `${lead.status === 'Closed' ? styles.closedCard + ' ' : ''}`
        }>
            <div className={
                styles.leftBar + ' ' +
                (lead.type === 'Hot' ? styles.barHot : lead.type === 'Warm' ? styles.barWarm : styles.barCold)
            } />
            <div className={styles.cardContent}>
                <div className={styles.leadDetails}>
                    <p className={styles.leadName}>{lead.name}</p>
                    <p className={styles.leadEmail}>{lead.email}</p>
                    <div className={styles.dateContainer}>
                        <p className={styles.dateLabel}>date</p>
                        <p className={styles.leadDate}>
                            <i className='bx bxs-calendar'></i>
                            {lead.scheduledDate ? lead.scheduledDate : lead.date}
                        </p>
                    </div>
                </div>
                <div className={styles.statusAndActions}>
                    <div className={
                        styles.statusTag + ' ' +
                        (lead.type === 'Hot' ? styles.statusHot : lead.type === 'Warm' ? styles.statusWarm : styles.statusCold) +
                        (lead.status === 'Closed' ? ' ' + styles.statusClosed : '')
                    }>
                        {lead.status}
                    </div>
                    <div className={styles.actionIcons}>
                        <button className={styles.iconButton} onClick={() => setActivePopover('type')}>
                            <i className='bx bxs-pencil'></i>
                        </button>
                        <button className={styles.iconButton} onClick={() => setActivePopover('time')}>
                            <i className='bx bxs-time'></i>
                        </button>
                        <button className={styles.iconButton} onClick={() => setActivePopover('status')}>
                            <i className='bx bx-chevron-down'></i>
                        </button>
                    </div>
                </div>
            </div>

            {activePopover && (
                <div className={styles.popoverContainer} ref={popoverRef}>
                    {activePopover === 'type' && (
                        <div className={styles.popover}>
                            <p className={styles.popoverTitle}>Type</p>
                            <button className={`${styles.popoverButton} ${styles.hot}`} onClick={() => handleTypeSelect('Hot')}>Hot</button>
                            <button className={`${styles.popoverButton} ${styles.warm}`} onClick={() => handleTypeSelect('Warm')}>Warm</button>
                            <button className={`${styles.popoverButton} ${styles.cold}`} onClick={() => handleTypeSelect('Cold')}>Cold</button>
                        </div>
                    )}
                     {activePopover === 'time' && (
                        <div className={styles.popover}>
                            <p className={styles.popoverTitle}>Date & Time</p>
                            <input type="text" placeholder="dd/mm/yy" className={styles.popoverInput} value={dateInput} onChange={e => setDateInput(e.target.value)} />
                            <input type="text" placeholder="02:30 PM" className={styles.popoverInput} value={timeInput} onChange={e => setTimeInput(e.target.value)} />
                            <button className={styles.saveButton} onClick={handleDateSave}>Save</button>
                        </div>
                    )}
                    {activePopover === 'status' && (
                         <div className={styles.popover}>
                            <p className={styles.popoverTitle}>
                                Lead Status 
                                <span className={styles.tooltip}>
                                    <i className='bx bxs-info-circle'></i>
                                    <span className={styles.tooltiptext}>Lead cannot be closed if scheduled.</span>
                                </span>
                            </p>
                            <button
                                className={styles.popoverOption + (statusDraft === 'Ongoing' ? ' ' + styles.active : '')}
                                onClick={() => setStatusDraft('Ongoing')}
                                style={{ pointerEvents: statusDraft === 'Ongoing' ? 'none' : 'auto' }}
                            >Ongoing</button>
                            <button
                                className={styles.popoverOption + (statusDraft === 'Closed' ? ' ' + styles.active : '')}
                                onClick={() => setStatusDraft('Closed')}
                                style={{ pointerEvents: statusDraft === 'Closed' ? 'none' : 'auto' }}
                            >Closed</button>
                            <button className={styles.saveButton} onClick={handleStatusSave}>Save</button>
                            {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LeadCard; 