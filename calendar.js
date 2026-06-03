// คลาสหลัก CalendarApp
class CalendarApp { // Composition (การประกอบวัตถุ)
  constructor(username) {
    this.username = username; // เก็บ username
    this.months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']; // สำหรับปฏิทินใหญ่
    this.daysOfWeek = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']; //สำหรับปฏิทินเล็ก
    
    this.today = new Date(); // เก็บวันที่ปัจจุบัน
    this.selectedYear = this.today.getFullYear();
    this.selectedMonth = this.today.getMonth();
    this.selectedDay = this.today.getDate(); // เก็บ วัน เดือน ปี ที่เลือกใส่ในปฏิทิน
    
    this.noteManager = new NoteManager(this.username); // จัดการ note ทั้งหมด (ที่ใช้ username เพราะเราต้องการให้ note แยกกัน)
    this.calendarView = new CalendarView(this); // จัดการสร้างปฏิทิน ของวัน เดือน ปี
    this.noteView = new NoteView(this); // แสดง note ทั้งหมดในการเลือกวันที่
    this.modalView = new ModalView(this);  // จัดการการแก้ไข หรือเพิ่มเติม note
    this.filterView = new FilterView(this); // จัดการการกรอง note
    this.themeManager = new ThemeManager(this); // จัดการ loght mode และ dark mode
    
    this.init(); // เรียก meathod init() เพื่อเริ่มต้นการทำงานของแอปพลิเคชัน
  }
  
  init() {
    this.setupEventListeners();  // ตั้งค่าการตอบสนองของปฏิทินและ note
    this.renderAll(); // แสดงปฏิทินและ note ทั้งหมด
  }
  
  renderAll() {
    this.calendarView.renderFullCalendar(); // แสดงปฏิทินขนาดใหญ่
    this.calendarView.renderMiniCalendar(); // แสดงปฏิทินขนาดเล็ก
    this.noteView.showNoteDetails(); // แสดง note ทั้งหมดในวันที่เลือก
  }
  
  changeMonth(offset) { // offset = 1 หรือ -1 เพื่อเปลี่ยนเดือน
    this.selectedMonth += offset; // เพิ่มลดเดือน
      
    
    if (this.selectedMonth < 0) { // ถ้าเดือนน้อยกว่า 0 ให้ไปเดือนธันวาคมของปีที่แล้ว
      this.selectedMonth = 11;
      this.selectedYear--;
    } else if (this.selectedMonth > 11) { // ถ้าเดือนมากกว่า 11 ให้ไปเดือนมกราคมของปีถัดไป
      this.selectedMonth = 0;
      this.selectedYear++;
    }
    
    this.renderAll();  // แสดงปฏิทินและ note ทั้งหมดอีกครั้ง
    this.calendarView.animateMonthChange(offset); // เรียกใช้ฟังก์ชัน animateMonthChange ใน CalendarView เพื่อแอนิเมชันการเปลี่ยนเดือน
  }
  
  selectDay(day) { // อัปเดตวันที่เลือก + ไฮไลต์ปฏิทินเล็ก + แสดงโน๊ต
    this.selectedDay = day; // เก็บวันที่ที่เลือก
    // ไฮไลต์ปฏิทินเล็กให้ตรงกับวันที่เลือกเสมอ (ทั้งคลิกจากปฏิทินใหญ่และปฏิทินเล็ก)
    this.calendarView.updateMiniCalendarSelection(day);
    this.noteView.showNoteDetails(); // แสดง note ทั้งหมดในวันที่เลือก
  }
   
  setupEventListeners() { // ตั้งค่าการตอบสนองของปฎิทินและ note
    // ปุ่มเปิด Modal
    document.getElementById('open-note-modal').addEventListener('click', () => {
      this.modalView.openAddNoteModal();  // เปิด modal เพื่อเพิ่ม note ใหม่
    });
    
    // ปุ่มเดือนก่อนหน้าและถัดไป (ปฏิทินหลัก)
    document.getElementById('prev-month').addEventListener('click', () => this.changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => this.changeMonth(1));
    
    // ปุ่มเดือนก่อนหน้าและถัดไป (ปฏิทินย่อ)
    document.getElementById('prev-month-mini').addEventListener('click', () => this.changeMonth(-1));
    document.getElementById('next-month-mini').addEventListener('click', () => this.changeMonth(1));
    
    // ปิด Modal เมื่อคลิกพื้นหลัง
    document.getElementById('note-modal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('note-modal')) {
        this.modalView.closeModal();
      }
    });
  }
}
// คลาส NoteManager
class NoteManager { // Encapsulation
  constructor(username) {
    // ตั้งค่าเริ่มต้นสำหรับ username (โดยจะแยกแต่ละ username ตามการคั้งค่า)
    this.username = username; // โหลดข้อมูลจาก localStorage
    this.notes = {}; // เก็บข้อมูลประเภทโน๊ต
    this.selectedTags = []; // ตัวกรองประเภท
    this.currentEditingNote = null; // แก้ไขโน๊ต สำหรับการแสดง UI
    this.loadNotes(); // บันทึกใน localStorage
  }

  loadNotes() {
    // โหลด note ใน localStorage จาก username
    const savedNotes = localStorage.getItem(`premium-calendar-notes-${this.username}`); 
    // จะ save ข้อมูลแบบ String ใน localStroage เฉพาะ username
    if (savedNotes) {
      try {
        this.notes = JSON.parse(savedNotes) || {}; // แปลง string เป็น object จากคำสั่ง JSON.parse() แต่ถ้าไม่มีจะเก็บใน {}
      } catch (e) {
        console.error('Error parsing notes:', e); // แสดง error จากนั้นเซ็ตค่าเป็น object ว่าง
        this.notes = {};
      }
    }
  }

  saveNotes() {
    // save note ใน localStorage ให้ถาวร
    try {
      localStorage.setItem(`premium-calendar-notes-${this.username}`, JSON.stringify(this.notes)); 
      // คำสั่งบันทึก note ใน browser โดยแยกประเภทข้อมูลสำหรับ username และแปลง object เป็น string
    } catch (e) {
      console.error('Error saving notes:', e); // ป้องกัน error
    }
  }

  addNote(dateKey, text, tags) {
    // เลือกวันสำหรับการเพิ่ม note
    if (!this.notes[dateKey]) {
      this.notes[dateKey] = []; // เช็คว่าวันที่เลือกมีไหมถ้าไม่มีให้เป็น array ว่าง
    }

    const newNote = { 
      text,
      type: [...tags], // สร้างโน๊ตใหม่ โดยมี text กับ type (tag)
      createdAt: new Date().toISOString() // สร้าง object ในเวลานั้น
    };

    this.notes[dateKey].push(newNote); // เพิ่ม note ใน array
    this.saveNotes(); // บันทึกข้อมูลทั้งหมดใน localStorage
    return newNote; // แสดงโน๊ต
  }

  updateNote(dateKey, index, text, tags) {
    // เลือกวันที่จะ update
    this.notes[dateKey][index] = {
      text,
      type: [...tags], // เปลี่ยน text , tag
      createdAt: this.notes[dateKey][index].createdAt, // ดึงข้อมูลเก่ามาแก้ไข
      updatedAt: new Date().toISOString() // อัพเดทวันและเวลา
    };

    this.saveNotes();
    return this.notes[dateKey][index];
  }

  deleteNote(dateKey, index) {
    // ลบโน๊ต ออก
    if (this.notes[dateKey] && this.notes[dateKey][index]) {
      this.notes[dateKey].splice(index, 1); // ลบโน๊ตจากตำแหน่งที่เลือก

      if (this.notes[dateKey].length === 0) {
        // ถ้าลบจนเหลือ 0 ให้ลบ dataKey ออกจาก this.notes
        delete this.notes[dateKey];
      }

      this.saveNotes();
      return true;
    }
    return false;
  }

  getNotesForDate(dateKey) {
    // ค้นหาหมายเหตุที่เกี่ยวข้องกับ dateKey จากอ็อบเจ็กต์ this.notes
    return this.notes[dateKey] || []; // ถ้าไม่มีจะเป็นค่าว่าง
  }

  getFilteredNotes(dateKey, visibleCategories) {
    // ฟังก์ชันนี้เรียกใช้ getNotesForDate(dateKey) เพื่อดึงข้อมูลหมายเหตุสำหรับวันที่ dateKey ที่ระบุและเก็บไว้ในตัวแปร notes
    const notes = this.getNotesForDate(dateKey);
    return notes.filter(note => 
      note.type.some(t => visibleCategories.includes(t)) // เช็คประเภท type ของโน๊ต
    );
  }
}

// คลาส CalendarView
class CalendarView { // จัดการสร้างปฏิทิน ของวัน เดือน ปี (Polymorphism)
  constructor(app) { // Application ที่เก็บพวกปี/เดือนที่เลือก, note ต่างๆ
    this.app = app;
  }

  renderFullCalendar() { // แสดงปฏิทินใหญ่
    const calendar = document.getElementById('full-calendar');
    calendar.innerHTML = ''; // ล้างช้อมูลเก่าทั้งหมด
    
    const firstDay = new Date(this.app.selectedYear, this.app.selectedMonth, 1).getDay(); // วันแรกของเดือน (getDay() ตำแหน่งวัน อาทิตย์ = 0, ... , เสาร์ = 6)
    const totalDays = new Date(this.app.selectedYear, this.app.selectedMonth + 1, 0).getDate(); // หาจำนวนวันทั้งหมด(สร้างวันที่ 0 ของเดือนถัดไป = ได้วันสุดท้ายของเดือนนี้ getDate() = จำนวนวันในเดือน)
    const prevMonthDays = new Date(this.app.selectedYear, this.app.selectedMonth, 0).getDate(); // หาจำนวนวันในเดือนที่แล้ว (วันที่ 0 ของเดือนปัจจุบัน = วันสุดท้ายของเดือนที่แล้ว)
    
    // วันจากเดือนก่อนหน้า
    for (let i = 0; i < firstDay; i++) { // ถ้ามีวันจากเดือนที่แล้วมาต่อที่ช่องว่างด้านหน้าปฏิทิน
      const day = prevMonthDays - firstDay + i + 1; // สมมติเดือนนี้เริ่มพฤหัส → ต้องวาดวัน จันทร์-พุธ จากเดือนที่แล้วมาด้วย
      calendar.appendChild(this.createDayElement(day, true, false)); // บอกว่า "เป็นวันของเดือนอื่น" (previous month)
    }
    
    // วันในเดือนปัจจุบัน 
    for (let day = 1; day <= totalDays; day++) { // วนตั้งแต่วันที่ 1 ถึงวันที่สิ้นเดือน
      calendar.appendChild(this.createDayElement(day, false, false)); // บอกว่า "เป็นวันของเดือนนี้" (current month)
    }
    
    // วันจากเดือนถัดไป
    const remainingCells = 42 - (firstDay + totalDays); // สร้างจำนวนช่องว่างที่เหลือในปฏิทิน (42 ช่อง - (วันแรก + วันสุดท้ายของเดือนนี้))
    for (let day = 1; day <= remainingCells; day++) {
      calendar.appendChild(this.createDayElement(day, true, false));
    }
    
    this.updateMonthYearDisplay();
  }

  renderMiniCalendar() { // แสดงปฏิทินเล็ก
    const calendar = document.getElementById('mini-calendar');
    calendar.innerHTML = '';
    
    const firstDay = new Date(this.app.selectedYear, this.app.selectedMonth, 1).getDay();
    const totalDays = new Date(this.app.selectedYear, this.app.selectedMonth + 1, 0).getDate();
    const prevMonthDays = new Date(this.app.selectedYear, this.app.selectedMonth, 0).getDate();
    
    // วันจากเดือนก่อนหน้า
    for (let i = 0; i < firstDay; i++) {
      const day = prevMonthDays - firstDay + i + 1;
      const div = this.createDayElement(day, true, true);
      div.classList.add('other-month');
      calendar.appendChild(div);
    }
    
    // วันในเดือนปัจจุบัน
    for (let day = 1; day <= totalDays; day++) {
      const div = this.createDayElement(day, false, true);
      if (day === this.app.selectedDay) {
        div.classList.add('selected');
      }
      calendar.appendChild(div);
    }
    
    // วันจากเดือนถัดไป
    const remainingCells = 35 - (firstDay + totalDays);
    for (let day = 1; day <= remainingCells; day++) {
      const div = this.createDayElement(day, true, true);
      div.classList.add('other-month');
      calendar.appendChild(div);
    }
    
    this.updateMiniMonthYearDisplay();
  }

  createDayElement(day, isOtherMonth, isMini) { // สร้างวันที่ในปฎิทินเล็ก (วันที่ วันเดือนก่อน / หลัง )
    const key = isOtherMonth ? '' : `${this.app.selectedYear}-${this.app.selectedMonth + 1}-${day}`; // สร้าง key สำหรับวันที่เลือก (ถ้าเป็นเดือนอื่นจะไม่สร้าง key)
    const div = document.createElement('div'); // สร้าง div สำหรับวันที่เลือก
    div.className = `day ${isMini ? 'mini-view' : 'main-view'} ${isOtherMonth ? 'other-month' : ''}`; // แสดงวันที่ ของปฏิทินใหญ่/เล็ก ถ้าเป็นเดือนอื่นให้แสดงเป็นตัวจาง
    
    // หมายเลขวัน
    const dayNumber = document.createElement('div'); // สร้าง div สำหรับหมายเลขวัน
    dayNumber.className = 'day-number';
    dayNumber.textContent = day; // แสดงตัวเลข
    div.appendChild(dayNumber);
    
    // เน้นวันปัจจุบัน
    if (!isOtherMonth && this.isToday(day)) { // ถ้าเป็นวันนี้ของเดือน
      div.classList.add('today'); // เน้นวันนี้ (Css)
    }
    
    // แสดงโน๊ต
    if (!isOtherMonth && this.app.noteManager.getNotesForDate(key).length > 0) {  //ถ้าเป็นวันในเดือนนี้ และมี note (เช็กว่า getNotesForDate(key) มีข้อมูล)
      const filteredNotes = this.app.noteManager.getFilteredNotes(key, this.app.filterView.visibleCategories); //ดึงเฉพาะโน้ตที่ "ผ่านการกรอง" จาก filter (เช่น หมวดหมู่ที่เลือก)

      
      if (filteredNotes.length > 0) { // ถ้ามีโน๊ตให้แสดงโน๊ตในวันที่เลือก
        if (!isMini) {
          this.renderNotesInDay(div, key, filteredNotes);  //ถ้าเป็นปฏิทินใหญ่ (full calendar) → วาด "ข้อความโน้ต" ลงไปเลย (renderNotesInDay)
        } else {
          this.renderMarkersInDay(div, key, filteredNotes); //ถ้าเป็น mini calendar → วาด "จุดสีเล็กๆ" บอกว่ามีโน้ต (renderMarkersInDay)
        }
      }
    }
    
    // การคลิกที่วัน
    if (!isOtherMonth) {
      div.addEventListener('click', () => this.app.selectDay(day));
    }
    
    return div;
  }

  isToday(day) { // เช็คว่าเป็นวันนี้หรือไม่
    return (
      this.app.selectedYear === this.app.today.getFullYear() && // ปีที่เลือกเป็นปีปัจจุบันไหม
      this.app.selectedMonth === this.app.today.getMonth() &&  //  เดือนที่เลือกเป็นเดือนปัจจุบันไหม
      day === this.app.today.getDate()  // วันที่เลือกเป็นวันที่ปัจจุบันไหม
    );
  }

  renderNotesInDay(dayElement, key, notesToRender) { // สร้าง container สำหรับเก็บรายการโน้ตในแต่ละวัน
    const noteList = document.createElement('div');  // สร้าง div สำหรับเป็น "กล่องรวมโน้ต" ภายในวัน
    noteList.className = 'note-list';
    
    notesToRender.slice(0, 3).forEach(note => { // วนลูปแสดงโน้ตสูงสุด 3 รายการ
      const noteItem = document.createElement('div');
      noteItem.className = `note-item ${note.type[0]}`; // กำหนดคลาสตามประเภทโน้ต (เช่น work, personal)
      
      const noteText = document.createElement('div');
      noteText.textContent = this.truncateText(note.text, 20);  // กำหนดข้อความ 20 ตัวอักษร
      noteItem.appendChild(noteText);
      
      const noteType = document.createElement('div');
      noteType.className = 'note-type';
      noteType.innerHTML = `<i class="fas fa-tag"></i> ${note.type.join(', ')}`; // แสดงประเภทโน้ต (เช่น work, personal)
      noteItem.appendChild(noteType);
      
      noteList.appendChild(noteItem);
    });
    
    if (notesToRender.length > 3) { // ถ้ามีโน้ตมากกว่า 3 รายการให้แสดงข้อความว่า "โน๊ตเพิ่มเติม"
      const moreNotes = document.createElement('div');
      moreNotes.className = 'note-item more';
      moreNotes.textContent = `+ ${notesToRender.length - 3} โน๊ตเพิ่มเติม`; // แสดงโน๊ตเพิ่มเติม
      noteList.appendChild(moreNotes);
    }
    
    dayElement.appendChild(noteList); // เพิ่มโน๊ตในวันนั้นๆ
  }

  renderMarkersInDay(dayElement, key, notesToRender) {  // วาดจุดสีเล็กๆ บอกว่ามีโน้ตในวันนั้น (ปฏิทินเล็ก)
    const markerContainer = document.createElement('div'); //  สร้าง div ใหม่เพื่อเอาไว้ "รวม marker" ของแต่ละวัน
    markerContainer.className = 'marker-container';
    
    const allTypes = notesToRender.flatMap(note => note.type); // รวมเอา ประเภททั้งหมด ของโน้ตในวันนั้น
    const uniqueTypes = [...new Set(allTypes)].slice(0, 3); // กรองเอา ประเภทที่ไม่ซ้ำกัน (Set) แล้วเอาแค่ 3 อันแรก (slice(0, 3))
    
    uniqueTypes.forEach(type => { // วนลูปในประเภทที่ไม่ซ้ำกัน (ที่ได้จากบรรทัดบน)
      const marker = document.createElement('div');
      marker.className = `marker ${type}`;  //  ชื่อประเภท → เอาไปใช้ตั้งสี
      markerContainer.appendChild(marker);
    });
    
    dayElement.appendChild(markerContainer);  //เอา marker ที่สร้าง มาใส่ใน markerContainer
  }

  truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  updateMiniCalendarSelection(day) { // อัปเดตการไฮไลต์ วันที่ใน mini-calendar ให้ตรงกับวันที่เลือก
    document.querySelectorAll('#mini-calendar .day').forEach(d => {
      d.classList.remove('selected');
      // อย่าไฮไลต์วันจากเดือนก่อน/หลัง (เลขวันตรงกันได้ เช่น 30 มี.ค. กับ 30 เม.ย.)
      if (d.classList.contains('other-month')) return;
      const dayNumEl = d.querySelector('.day-number');
      const dayText = dayNumEl ? dayNumEl.textContent.trim() : d.textContent.trim();
      if (dayText === String(day)) {
        d.classList.add('selected');
      }
    });
  }

  updateMonthYearDisplay() { // ฟังก์ชันนี้ อัปเดตข้อความเดือน/ปี ในปฏิทินใหญ่
    const monthYearElement = document.getElementById('month-year'); // หา element id month-year ซึ่งเป็นตัวโชว์ชื่อเดือนกับปี
    if (monthYearElement) {
      monthYearElement.textContent = `${this.app.months[this.app.selectedMonth]} ${this.app.selectedYear}`; // แสดงชื่อเดือนและปีในปฏิทิน
    } 
  }

  updateMiniMonthYearDisplay() {  //ฟังก์ชันนี้ อัปเดตข้อความเดือน/ปี สำหรับ mini-calendar
    const monthYearElement = document.getElementById('month-year-mini');  //หา element id month-year-mini
    if (monthYearElement) { //เช็กว่ามี element จริง ๆ
      monthYearElement.textContent = `${this.app.months[this.app.selectedMonth].substring(0, 3)} ${this.app.selectedYear}`;  //ใส่ข้อความเดือน + ปี แต่เอาแค่ ชื่อเดือน 3 ตัวแรก
    }
  }

  animateMonthChange(offset) { //แอนิเมชันเลื่อน/จาง เมื่อเปลี่ยนเดือนใน full-calendar
    const calendar = document.getElementById('full-calendar'); // element full-calendar
    if (calendar) {
      calendar.style.opacity = '0'; //ทำให้ calendar หายไปก่อน
      calendar.style.transform = `translateX(${offset > 0 ? 20 : -20}px)`; //ขยับ calendar นิดนึงในแนวนอน (ซ้าย/ขวา)
      setTimeout(() => { // ทำให้ calendar กลับมาแสดงอีกครั้ง
        calendar.style.opacity = '1'; // ทำให้ calendar ค่อย ๆ ปรากฏ
        calendar.style.transform = 'translateX(0)'; // กลับมาตำแหน่งตรงกลางเหมือนเดิม
      }, 300);
    }
  }
}

// คลาส NoteView
class NoteView { // แสดง note ทั้งหมดในการเลือกวันที่ (Polymorphism)
  constructor(app) {
    this.app = app; //สร้าง NoteView โดยรับ app (โปรแกรมหลัก) มาเก็บไว้ใน this.app
  }

  showNoteDetails() { // แสดง รายละเอียดโน๊ต ของวันที่ผู้ใช้เลือก
    const key = `${this.app.selectedYear}-${this.app.selectedMonth + 1}-${this.app.selectedDay}`; // สร้าง key เป็นข้อความ เพื่อระบุวันเฉพาะ
    const detailsContent = document.querySelector('.note-details .details-content'); //หา element ที่จะแสดงรายละเอียดโน้ต
    
    if (!detailsContent) return; //ถ้า element ไม่มีจริง (null) ก็หยุดทำงานทันที
    
    const notes = this.app.noteManager.getNotesForDate(key); //ดึงโน้ตทั้งหมดของวันนั้น (notes)
    const filteredNotes = this.app.noteManager.getFilteredNotes(key, this.app.filterView.visibleCategories); //ดึงโน้ตที่ตรงกับตัวกรอง (filteredNotes) เช่น หมวดหมู่ที่เลือกไว้
    
    if (notes.length > 0) { // ถ้ามีโน๊ตในวันนั้น
      if (filteredNotes.length > 0) { // ถ้ามีโน๊ตที่ผ่านตัวกรอง
        detailsContent.innerHTML = `
          <h4 class="selected-date">${this.app.selectedDay} ${this.app.months[this.app.selectedMonth]} ${this.app.selectedYear}</h4>
          <div id="notes-list" class="notes-list"></div>
        `; //แสดงหัวข้อวัน และเตรียม container ไว้สำหรับ list โน๊ต
        
        const notesList = document.getElementById('notes-list'); //หา div ที่จะใส่รายการโน๊ตจริงๆ
        if (notesList) { 
          filteredNotes.forEach((note, index) => { //วนลูปใส่โน๊ตที่ผ่านการกรอง
            const originalIndex = notes.findIndex(n => 
              n.text === note.text && 
              JSON.stringify(n.type) === JSON.stringify(note.type)
            ); // หา index ต้นฉบับของโน้ตตัวนี้ใน notes จริง
            
            const noteItem = this.createNoteDetailItem(key, note, originalIndex);
            notesList.appendChild(noteItem); //สร้าง element สำหรับแต่ละโน้ต แล้วเอาไปเพิ่มในหน้าจอ
            
            this.setupNoteItemEventListeners(noteItem, key, originalIndex);
          }); //ใส่ event ให้แต่ละโน๊ต เช่น ปุ่ม "แก้ไข" และ "ลบ"
        }
      } else {
        detailsContent.innerHTML = `
          <h4 class="selected-date">${this.app.selectedDay} ${this.app.months[this.app.selectedMonth]} ${this.app.selectedYear}</h4>
          <p class="no-notes"><i class="far fa-smile"></i> ไม่มีโน๊ตที่ตรงกับตัวกรอง</p>
        `; // บอกผู้ใช้ว่า "ไม่มีโน๊ตที่ตรงกับตัวกรอง"
      }
    } else { // กรณีไม่มีโน๊ตในวันนั้นเลย
      detailsContent.innerHTML = `
        <h4 class="selected-date">${this.app.selectedDay} ${this.app.months[this.app.selectedMonth]} ${this.app.selectedYear}</h4>
        <p class="no-notes"><i class="far fa-smile"></i> ยังไม่มีโน๊ตในวันนี้</p>
      `; //บอกผู้ใช้ว่า "ยังไม่มีโน๊ตในวันนี้"
    }
  }

  createNoteDetailItem(key, note, index) { //สร้าง element สำหรับ แต่ละโน๊ต ในรายละเอียด
    const noteItem = document.createElement('div');
    noteItem.className = `note-item ${note.type[0]}`;
    noteItem.dataset.key = key;
    noteItem.dataset.index = index; //สร้าง div แล้วตั้ง class และบันทึก key กับ index ไว้เป็นข้อมูลแฝง ไว้อ้างอิงเวลาจะลบหรือแก้ไข
    
    noteItem.innerHTML = `
      <div class="note-text">${note.text}</div>
      <div class="note-footer">
        <div class="note-types">
          <i class="fas fa-tag"></i> ${note.type.join(', ')}
          ${note.updatedAt ? '<span class="updated-info">(แก้ไขแล้ว)</span>' : ''}
        </div>
        <div class="note-actions">
          <button class="edit-btn">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `; // วาง HTML สำหรับข้อความโน๊ต, ประเภท, ปุ่มแก้ไข และปุ่มลบ
    return noteItem;
  }

  setupNoteItemEventListeners(noteItem, key, index) { //ใส่ event ลงในแต่ละ noteItem
    const deleteBtn = noteItem.querySelector('.delete-btn');
    if (deleteBtn) { // ถ้ามีปุ่มลบ กำหนดเมื่อคลิก
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation(); //หยุดไม่ให้คลิกส่งผลกระทบกับ element อื่นๆ
        if (confirm('คุณแน่ใจว่าต้องการลบโน๊ตนี้?')) {
          if (this.app.noteManager.deleteNote(key, index)) { // ลบโน๊ตจาก noteManager ถ้าสำเร็จ
            this.showNoteDetails();
            this.app.calendarView.renderFullCalendar();
            this.app.calendarView.renderMiniCalendar(); //อัปเดตหน้าจอใหม่หมด: รายละเอียด, ปฏิทินหลัก, มินิปฏิทิน
          }
        }
      });
    }
    
    const editBtn = noteItem.querySelector('.edit-btn');
    if (editBtn) { //ถ้ามีปุ่มแก้ไข กำหนดเมื่อคลิก
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.app.modalView.openEditModal(key, index); //เปิด Modal เพื่อแก้ไขโน๊ตตัวนี้
      });
    }
  }

  animateNoteAddition() { // สร้าง animation เวลาเพิ่มโน๊ตใหม่
    const detailsContent = document.querySelector('.note-details .details-content'); //หา element ที่แสดงโน๊ต
    if (detailsContent) {
      detailsContent.style.transform = 'translateX(-10px)';
      setTimeout(() => {
        detailsContent.style.transform = 'translateX(0)';
      }, 200); // ทำให้เลื่อนขยับ
    }
  }

  animateNoteUpdate() { //สร้าง animation เวลาแก้ไขโน๊ต
    const noteItems = document.querySelectorAll('.note-item'); // หาโน๊ตทุกตัวที่แสดงอยู่
    noteItems.forEach(item => {
      item.classList.add('updated');
      setTimeout(() => {
        item.classList.remove('updated');
      }, 500); //ใส่คลาส updated ชั่วคราวเพื่อทำ effect กระพริบหรือเปลี่ยนสีเบาๆ
    });
  }
}

// คลาส ModalView
class ModalView { // จัดการการแก้ไข หรือเพิ่มเติม note (Abstraction)
  constructor(app) {
    this.app = app;
  }

  openAddNoteModal() { // ฟังก์ชันเปิด Modal เพื่อ "เพิ่มโน้ตใหม่"
    this.resetModal(); // เคลียร์ค่าเก่า ใน Modal ก่อน เพื่อกันข้อมูลค้างจากการเพิ่มครั้งก่อน เช่น text หรือ tag
    this.app.noteManager.selectedTags = [];
    this.app.noteManager.currentEditingNote = null; // // รีเซ็ตข้อมูลเกี่ยวกับ tag และสถานะกำลังแก้ไข
    this.updateTagButtons(); //อัปเดตปุ่ม Tag บน UI ให้ไม่มีปุ่มไหนโดนเลือก (clear selected state)
    
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-edit"></i> เพิ่มโน๊ตใหม่'; //เปลี่ยนชื่อหัว Modal เป็น "เพิ่มโน๊ตใหม่" พร้อมไอคอน
    document.getElementById('save-note').innerHTML = '<i class="fas fa-save"></i> บันทึกโน๊ต'; //เปลี่ยนข้อความปุ่ม save ให้เป็น "บันทึกโน๊ต" พร้อมไอคอน
    document.getElementById('save-note').onclick = () => this.saveNote(); //กำหนดว่า เมื่อกดปุ่ม Save จะเรียก saveNote()
    
    document.getElementById('note-modal').classList.add('show'); //เพิ่มคลาส show เพื่อ แสดง Modal
  }

  openEditModal(key, index) { // ฟังก์ชันเปิด Modal เพื่อ "แก้ไขโน้ตเดิม" รับ key (วันที่) กับ index (ตำแหน่งโน้ตในวันนั้น)

    const note = this.app.noteManager.getNotesForDate(key)[index]; //ดึงข้อมูลโน้ตตัวที่เลือกมาใช้งาน เพื่อเอาข้อมูลเก่าไปกรอกใน Modal
    this.app.noteManager.currentEditingNote = { key, index }; //บันทึกสถานะว่า "ตอนนี้กำลังแก้ไขโน้ตตัวไหน" (เก็บ key และ index ไว้)
    this.app.noteManager.selectedTags = [...note.type]; //ตั้งค่า tag ที่เลือก ตาม tag ของโน้ตเดิมที่จะแก้ไข
    
    document.getElementById('note-text').value = note.text; //กรอกข้อความโน้ตเก่าเข้าไปใน input
    this.updateTagButtons(); //อัปเดตปุ่ม tag ให้ไฮไลต์เฉพาะ tag ที่โน้ตนี้เคยเลือก
    
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-edit"></i> แก้ไขโน๊ต';
    document.getElementById('save-note').innerHTML = '<i class="fas fa-save"></i> อัปเดตโน๊ต'; //เปลี่ยนหัวข้อและปุ่ม Save เป็น "แก้ไขโน๊ต" และ "อัปเดตโน๊ต"
    document.getElementById('save-note').onclick = () => this.updateNote(); //กำหนดว่า กดปุ่ม Save แล้วจะ แก้ไขโน้ตเก่า (updateNote())
    
    document.getElementById('note-modal').classList.add('show'); //เปิด Modal ให้แสดงขึ้น
  }

  closeModal() { //ปิด Modal และรีเซ็ตข้อมูลข้างใน เพื่อให้ Modal ว่างทุกครั้งที่ปิด
    document.getElementById('note-modal').classList.remove('show');
    this.resetModal();
  }

  resetModal() { //เคลียร์ข้อความและ tag ที่เลือกทุกอย่าง
    document.getElementById('note-text').value = '';
    this.app.noteManager.selectedTags = [];
    this.app.noteManager.currentEditingNote = null;
    this.updateTagButtons();
  }

  saveNote() { //ฟังก์ชันเซฟโน้ตใหม่
    const text = document.getElementById('note-text').value.trim();
    const key = `${this.app.selectedYear}-${this.app.selectedMonth + 1}-${this.app.selectedDay}`;// ดึงข้อความจาก inputสร้าง key เพื่อระบุวันที่ 
    
    if (!text || this.app.noteManager.selectedTags.length === 0) {
      alert('กรุณากรอกข้อความและเลือกอย่างน้อยหนึ่งประเภท');
      return; // เช็กว่า กรอกข้อความแล้วหรือยัง และเลือก tag หรือยัง ถ้ายังเตือนและหยุดการทำงานทันที (เพื่อกันข้อมูลผิดพลาด)
    }

    this.app.noteManager.addNote(key, text, this.app.noteManager.selectedTags); //เรียก addNote() เพื่อบันทึกโน้ตใหม่
    this.closeModal(); // ปิด Modal หลังบันทึกเสร็จ
    this.app.noteView.showNoteDetails();
    this.app.calendarView.renderFullCalendar();
    this.app.calendarView.renderMiniCalendar(); //อัปเดตหน้ารายละเอียด, ปฏิทินใหญ่ และปฏิทินเล็ก
    this.app.noteView.animateNoteAddition(); //ทำ Animation ตอนเพิ่มโน้ต ➔ UX ดีขึ้น
  }

  updateNote() { //ฟังก์ชันแก้ไขโน้ตเก่า
    if (!this.app.noteManager.currentEditingNote) return; //ถ้าไม่ได้อยู่ในสถานะแก้ไข ไม่ทำอะไรเลย ป้องกัน error
    
    const { key, index } = this.app.noteManager.currentEditingNote;
    const text = document.getElementById('note-text').value.trim(); //ดึง key และ index ของโน้ตที่จะแก้ดึงข้อความใหม่ที่กรอกมา
    
    if (!text || this.app.noteManager.selectedTags.length === 0) {
      alert('กรุณากรอกข้อความและเลือกอย่างน้อยหนึ่งประเภท');
      return; //เช็กเหมือนตอนเพิ่มโน้ต ว่ากรอกข้อมูลครบหรือยัง
    }

    this.app.noteManager.updateNote(key, index, text, this.app.noteManager.selectedTags); //อัปเดตโน้ตในระบบ noteManager
    this.closeModal(); //ปิด Modal
    this.app.noteView.showNoteDetails(); // อัปเดตรายละเอียดโน้ต
    this.app.noteView.animateNoteUpdate();
  }

  updateTagButtons() {
    document.querySelectorAll('.tag-btn').forEach(btn => {
      if (btn.dataset.value && this.app.noteManager.selectedTags.includes(btn.dataset.value)) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    }); //ทำให้ปุ่ม tag มีการเน้น (selected/unselected) ตาม tag ที่เลือกเพื่อให้ผู้ใช้เห็น tag ที่เลือกแบบ real-time
  }

  toggleTag(tag) { // สลับสถานะการเลือกหรือยกเลิกการเลือก
    const index = this.app.noteManager.selectedTags.indexOf(tag); //ค้นหาว่า แท็ก ที่ถูกส่งเข้ามา (tag) อยู่ในอาเรย์ selectedTags ของ `noteManager หรือไม่
    if (index === -1) {
      this.app.noteManager.selectedTags.push(tag); // แท็กที่ส่งเข้ามาไม่มีอยู่ใน selectedTags ดังนั้นเราจึง เพิ่มแท็กเข้าไป ใน selectedTags โดยใช้ push(tag)
    } else {
      this.app.noteManager.selectedTags.splice(index, 1); //หมายความว่า แท็กที่ส่งเข้ามามีอยู่แล้ว ใน selectedTags ดังนั้นเราจึง ลบแท็กออกจาก selectedTags โดยใช้ splice(index, 1)
    }
    this.updateTagButtons();
  }
}

// คลาส FilterView
class FilterView { // ใช้แยกหน้าที่จัดการ "ตัวกรองประเภทโน้ต" ออกจากคลาสอื่น เพื่อโค้ดอ่านง่ายและแยกความรับผิดชอบ
  constructor(app) {
    this.app = app;
    this.visibleCategories = ['work', 'personal', 'reminder', 'finance', 'health', 'family', 'travel', 'education']; //กำหนด หมวดหมู่ที่แสดงอยู่ปัจจุบัน เป็นค่าเริ่มต้น (คือทั้งหมด)
    this.setupFilterEventListeners(); // เรียก setupFilterEventListeners() ตั้งแต่แรกเลย เพื่อเซ็ต event listener พวกคลิก, เช็กบ็อกซ์ ให้พร้อมทำงานทันที
  }

  setupFilterEventListeners() { // ผูกอีเวนต์ กับ ปุ่มต่างๆ
    // ตัวกรองประเภท
    const filterToggle = document.getElementById('filter-toggle'); // ปุ่มเปิด/ปิด ตัวเลือกประเภท
    if (filterToggle) {
      filterToggle.addEventListener('click', () => this.toggleFilterContent());
    } //  เซ็ตให้เมื่อกดปุ่มแล้วเรียก toggleFilterContent()
    
    // ตัวเลือกประเภท
    document.querySelectorAll('.filter-checkbox input').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => this.updateCategoryFilter(e.target)); // ให้แต่ละตัวตั้ง event เมื่อเปลี่ยนค่า (change) จะเรียก updateCategoryFilter แล้วส่ง checkbox ที่กดไปให้
    });
  }

  toggleFilterContent() { // ปุ่ม category
    const content = document.getElementById('filter-content');
    const icon = document.querySelector('#filter-toggle h3 i.fas.fa-chevron-up, #filter-toggle h3 i.fas.fa-chevron-down'); // เข้าถึง class icon เพื่ทำการแก้ไข
  
    // toggle เนื้อหาข้างล่าง
    content.classList.toggle('show');
  
    // toggle ไอคอนขึ้น/ลง
    if (icon.classList.contains('fa-chevron-up')) {
      icon.classList.remove('fa-chevron-up');
      icon.classList.add('fa-chevron-down');
    } else {
      icon.classList.remove('fa-chevron-down');
      icon.classList.add('fa-chevron-up');
    }
  }
  
  updateCategoryFilter(checkbox) { //  อัปเดตการกรองหมวดหมู่
    const type = checkbox.dataset.type; //ดึงค่า data-type ที่กำหนดใน HTML ของ checkbox
    if (checkbox.checked) { //ฟังก์ชันนี้ตรวจสอบสถานะของ checkbox ว่าถูกเลือก (checked) หรือไม่
      if (!this.visibleCategories.includes(type)) {
        this.visibleCategories.push(type); //ฟังก์ชันจะตรวจสอบว่า  มี type ที่เลือกอยู่แล้วหรือไม่
      }
    } else {
      this.visibleCategories = this.visibleCategories.filter(t => t !== type); //ฟังก์ชันจะลบ type ออกจาก visibleCategories โดยใช้ filter() 
    }
    
    this.app.noteView.showNoteDetails();
    this.app.calendarView.renderFullCalendar();
    this.app.calendarView.renderMiniCalendar();
  }
}

// คลาส ThemeManager
class ThemeManager { // การจัด theam light mode และ dark mode
  constructor(app) {
    this.app = app;
    this.init();
  }
  
  init() {
    // ตรวจสอบธีมที่เคยเลือก ถ้าไม่มีจะกำหนดเป็น light mode
    const savedTheme = localStorage.getItem('calendar-theme') || 'light';
    document.body.classList.add(savedTheme); // เพิ่ม class light แลพ dark
    
    // ตั้งค่าสวิตช์ธีม
    const toggle = document.getElementById('themeToggle'); // ปุ่มสลับ light และ dark
    if (toggle) {
      toggle.checked = savedTheme === 'dark'; // ถ้าสวิตซ์ถูกใช้งานจะเข้า mode dark
    }
    
    // เพิ่ม Event Listener สำหรับการเปลี่ยนธีม
    toggle.addEventListener('change', () => {
      if (toggle.checked) {
        document.body.classList.remove('light');
        document.body.classList.add('dark');
        localStorage.setItem('calendar-theme', 'dark');
      } else {
        document.body.classList.remove('dark');
        document.body.classList.add('light');
        localStorage.setItem('calendar-theme', 'light');
      }
    });
  }
}

// ระบบ login and logout
document.addEventListener('DOMContentLoaded', () => { // โหลดหน้าเว็บเสร็จแล้ว
    const username = localStorage.getItem('username');  // ดึงข้อมูล username จาก localStorage
    if (!username) {
      window.location.href = 'login.html';
      return; // ถ้าไม่มี username ให้ กลับไปหน้า login
    }

    document.getElementById('username').textContent = username; // แสดง username ในหน้าเว็บ

    window.app = new CalendarApp(username); // สร้าง instance ของ CalendarApp โดยส่ง username

    document.querySelectorAll('.tag-btn').forEach(btn => { // ค้นหา ทุกปุ่ม (button) ที่มี class .tag-btn
      btn.addEventListener('click', (e) => { // เมื่อคลิกปุ่ม tag-btn ให้ทำการกรองโน้ตตามประเภทที่เลือก
        if (e.currentTarget.dataset.value) { //เช็กว่าในปุ่มนั้นมีค่า data-value ไหม
          app.modalView.toggleTag(e.currentTarget.dataset.value); // ถ้ามีให้ทำการกรองโน้ตตามประเภทที่เลือก
        }
      });
    });
    
    // เพิ่ม Event Listener สำหรับปุ่มยกเลิกใน Modal
    document.getElementById('cancel-note').addEventListener('click', () => { //หา element ที่ id cancel-note
      app.modalView.closeModal(); //เพื่อปิดหน้าต่าง Modal ทันที
    });
  });

function logout() {
    localStorage.removeItem('username'); //ลบข้อมูล username ออกจาก localStorage
    window.location.href = 'login.html'; // กลับไปที่หน้า login
}
