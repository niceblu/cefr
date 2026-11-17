/** CEFR Placement Test - Google Apps Script backend.
 *  Data tersimpan di Google Sheet (sheet: Pengaturan, Soal, Hasil), semua bisa diatur dari panel admin. */
const LV = ['A1', 'A2', 'B1', 'B2'];
const DEF = {
  judul: 'CEFR Placement Test', institusi: 'Program Studi Pendidikan Bahasa Inggris', logo: '',
  sambutan: 'Kerjakan secara mandiri. Dilarang memakai kamus, ponsel, atau alat AI.',
  durasi: '40', kkm: '7', aksen: '#2f5bea', dibuka: 'ya', tulisan: 'ya', pin: '1234',
  soalTulis: 'Write 60–120 words to an English-speaking friend about your first semester at university. Say what you did, what was difficult, and what you plan to do differently next semester.'
};
const READ = {
  9: "Hi, I'm Dewi. I live in Kediri with my parents and my little brother. I get up at five o'clock every morning. On weekdays I go to school by bus, but on Sundays I help my mother in her shop.",
  19: "Last Saturday, Arif and his friends went to the beach. They left early in the morning because the trip took three hours. When they arrived, the weather was cloudy, so they decided not to swim. Instead, they played football on the sand and ate grilled fish for lunch.",
  29: "Many students now take online courses alongside their regular classes. Online courses are flexible because students can study at any time. However, some students find it hard to stay motivated without a teacher in the room, and they stop before the course ends. Experts suggest making a weekly study plan and joining online discussion groups.",
  39: "Some researchers argue that social media has made young people more aware of global issues such as climate change. Others point out that this awareness rarely leads to real action: sharing a post takes seconds, while changing one's daily habits takes sustained effort. The debate, therefore, is less about whether social media informs people and more about whether it moves them to act."
};
// Pertanyaan|A|B|C|D|Kunci
const SEED = `My brother ........ a teacher at a primary school.|am|is|are|be|B
Sinta ........ to campus by motorbike every day.|go|going|is go|goes|D
........ there any milk in the fridge?|Is|Are|Do|Does|A
Look! The children ........ in the garden.|play|plays|are playing|is playing|C
She is ........ honest person.|a|some|many|an|D
Our class starts ........ eight o'clock.|in|on|at|for|C
Rina is good at music. She ........ play the guitar and the piano.|can|cans|is can|can to|A
I usually have ........ at 6 a.m. before I go to campus.|dinner|kitchen|lunch|breakfast|D
My mother's sister is my .........|cousin|aunt|niece|uncle|B
What does Dewi do on Sundays?|She goes to school by bus.|She gets up late.|She helps her mother in the shop.|She visits her grandmother.|C
Last weekend we ........ my grandparents in Blitar.|visit|have visited|visited|are visiting|C
I ........ my phone yesterday, so I couldn't call you.|lost|lose|losed|have lost|A
This bag is ........ than the black one.|cheap|cheaper|cheapest|more cheap|B
Look at those dark clouds. It ........ rain.|will to|goes to|rains|is going to|D
How ........ money do you need for the trip?|many|any|much|a few|C
At 8 p.m. yesterday, I ........ TV with my family.|watch|was watching|have watched|am watching|B
There aren't ........ students in the library today.|some|much|a little|any|D
The train to Surabaya is late, so we have to wait at the .........|station|airport|harbour|garage|A
Sorry, you can't pay by card here. You need to pay in .........|change|price|cash|receipt|C
Why didn't they swim?|The trip was too long.|They arrived too late.|They wanted to play football first.|The weather was cloudy.|D
I ........ in this city since 2020.|live|have lived|lived|am living|B
You look tired. You ........ go to bed earlier.|must to|ought|should|had better to|C
If it ........ tomorrow, we will cancel the picnic.|rains|will rain|rained|would rain|A
If I ........ more free time, I would learn Japanese.|have|will have|would have|had|D
I'm thinking about ........ a part-time job next semester.|get|to get|getting|got|C
When we arrived at the cinema, the film ........ already ........ .|had / started|has / started|was / starting|did / start|A
She decided ........ her thesis topic after talking to her supervisor.|changing|to change|change|changed|B
Our lecturer asked us to ........ our assignments before Friday.|give up|look after|take off|hand in|D
Rudi is very ........; he talks to new people easily and makes friends quickly.|shy|outgoing|lazy|careful|B
According to the text, what is one problem with online courses?|They are too expensive.|Students cannot choose their study time.|Some students lose motivation and do not finish.|Discussion groups are not allowed.|C
The new library ........ by the end of next year.|will build|is building|has built|will be built|D
She told me that she ........ the report the day before.|finishes|has finished|had finished|will finish|C
My cousin, ........ works in Jakarta, is coming to visit us next week.|who|that|which|whose|A
She asked me where ........ .|I lived|do I live|did I live|I am live|A
I wish I ........ harder for the exam last month.|studied|would study|have studied|had studied|D
If she had left home earlier, she ........ the bus.|wouldn't miss|won't miss|wouldn't have missed|didn't miss|C
The lights are off and nobody is answering the door. They ........ gone out.|must have|should have|can have|would have|A
Before publishing a story, journalists should ........ the facts carefully.|argue|verify|predict|invent|B
Although I see your point, I'm afraid I can't ........ with you on this issue.|accept|approve|agree|admit|C
What is the main point of the text?|Social media gives young people wrong information.|Young people do not care about climate change.|Researchers agree that social media changes daily habits.|The real question is whether social media leads people to act.|D`;

const API_FN = ['getPublic', 'submit', 'adminLogin', 'adminData', 'adminSaveCfg', 'adminSaveQs', 'adminClearRes', 'pdfSelf', 'adminPdf', 'adminPdfAll'];
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

/** Dipanggil oleh frontend di GitHub Pages: body JSON {fn, args}. */
function doPost(e) {
  try {
    const m = JSON.parse(e.postData.contents);
    if (API_FN.indexOf(m.fn) < 0) throw new Error('Fungsi tidak dikenal.');
    return json_({ ok: true, data: this[m.fn].apply(null, m.args || []) });
  } catch (err) { return json_({ ok: false, error: String(err.message || err) }); }
}

/** Jika file Index ada, tampilkan UI di Apps Script; jika tidak, balas status API. */
function doGet() {
  try {
    return HtmlService.createHtmlOutputFromFile('Index').setTitle(cfg_().judul)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  } catch (err) { return json_({ ok: true, service: 'CEFR Placement Test API' }); }
}

function ss_() {
  let s = SpreadsheetApp.getActive();
  if (s) return s;
  const p = PropertiesService.getScriptProperties(), id = p.getProperty('SSID');
  if (id) return SpreadsheetApp.openById(id);
  s = SpreadsheetApp.create('CEFR Placement Test - Database');
  p.setProperty('SSID', s.getId());
  return s;
}
function sh_(name, head, seed) {
  const s = ss_();
  let sh = s.getSheetByName(name);
  if (!sh) {
    sh = s.insertSheet(name);
    sh.appendRow(head);
    sh.getRange(1, 1, 1, head.length).setFontWeight('bold').setBackground('#e8edf8');
    sh.setFrozenRows(1);
    if (seed) seed(sh);
  }
  return sh;
}
function cfgSh_() {
  return sh_('Pengaturan', ['Kunci', 'Nilai'], sh => sh.getRange(2, 1, Object.keys(DEF).length, 2).setValues(Object.keys(DEF).map(k => [k, DEF[k]])));
}
function cfg_() {
  const c = Object.assign({}, DEF), v = cfgSh_().getDataRange().getValues();
  v.slice(1).forEach(r => { if (r[0]) c[r[0]] = String(r[1]); });
  return c;
}
function qSh_() {
  return sh_('Soal', ['No', 'Level', 'Bacaan', 'Pertanyaan', 'A', 'B', 'C', 'D', 'Kunci'], sh => {
    const rows = SEED.split('\n').map((l, i) => { const p = l.split('|'); return [i + 1, LV[Math.floor(i / 10)], READ[i] || '', ...p]; });
    sh.getRange(2, 1, rows.length, 9).setValues(rows);
  });
}
function qs_() {
  return qSh_().getDataRange().getValues().slice(1).filter(r => r[3]).map((r, i) => ({
    no: i + 1, level: r[1], bacaan: r[2], q: r[3], o: [r[4], r[5], r[6], r[7]], key: String(r[8]).toUpperCase()
  }));
}
function rSh_() {
  return sh_('Hasil', ['Waktu', 'Nama', 'NIM', 'Kelas', 'Skor', 'A1', 'A2', 'B1', 'B2', 'Penempatan', 'Catatan', 'Durasi (mnt)', 'Tulisan', 'Jawaban']);
}

/** Data publik: pengaturan (tanpa PIN) dan soal (tanpa kunci jawaban). */
function getPublic() {
  const c = cfg_(); delete c.pin;
  return { cfg: c, qs: qs_().map(q => ({ no: q.no, level: q.level, bacaan: q.bacaan, q: q.q, o: q.o })) };
}

function grade_(qs, jawab, c) {
  const kkm = Number(c.kkm) || 7, blok = {}, tot = {};
  LV.forEach(l => { blok[l] = 0; tot[l] = 0; });
  let skor = 0;
  qs.forEach(q => {
    if (!tot.hasOwnProperty(q.level)) return;
    tot[q.level]++;
    if (jawab && jawab[q.no] === q.key) { skor++; blok[q.level]++; }
  });
  const reached = LV.map(l => blok[l] >= Math.min(kkm, tot[l] || kkm));
  let place = 'A1 (developing)', i = 0;
  while (i < 4 && reached[i]) { place = LV[i]; i++; }
  const flag = reached.slice(i + 1).some(Boolean) ? 'Profil tidak biasa: ada level lebih tinggi tercapai setelah level di bawahnya gagal. Periksa dengan tugas menulis dan penilaian dosen.' : '';
  return { skor, total: qs.length, blok, tot, place, flag, kkm };
}

/** Penilaian dilakukan di server agar kunci jawaban tidak terlihat peserta. */
function submit(d) {
  const c = cfg_();
  if (c.dibuka !== 'ya') throw new Error('Tes sedang ditutup oleh admin.');
  const r = grade_(qs_(), d.jawab, c), b = r.blok;
  rSh_().appendRow([new Date(), d.nama, "'" + d.nim, d.kelas, r.skor, b.A1, b.A2, b.B1, b.B2, r.place, r.flag, Math.round((d.detik || 0) / 60), d.tulis || '', JSON.stringify(d.jawab || {})]);
  return r;
}

/* ---------- PDF jawaban mahasiswa ---------- */
function esc_(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>'); }
function frag_(d, full, c, qs) {
  const j = d.jawab || {}, g = grade_(qs, j, c);
  const rows = qs.map(q => {
    const a = j[q.no], ok = a === q.key;
    const t = a ? a + '. ' + esc_(q.o['ABCD'.indexOf(a)]) : '<i>(kosong)</i>';
    return '<tr><td>' + q.no + '</td><td>' + q.level + '</td><td>' + esc_(q.q) + '</td><td>' + t + '</td>' +
      (full ? '<td>' + q.key + '</td><td style="color:' + (ok ? '#12a072' : '#e0454b') + '"><b>' + (ok ? 'Benar' : 'Salah') + '</b></td>' : '') + '</tr>';
  }).join('');
  return '<h2 style="margin:0;color:#2f5bea">' + esc_(c.judul) + '</h2><div style="color:#5a6785">' + esc_(c.institusi) + '</div><hr>' +
    '<table style="width:100%;border:0"><tr><td><b>Nama</b>: ' + esc_(d.nama) + '<br><b>NIM</b>: ' + esc_(d.nim) + '<br><b>Kelas</b>: ' + esc_(d.kelas) + '</td>' +
    '<td><b>Waktu</b>: ' + esc_(d.waktu) + '<br><b>Skor</b>: ' + g.skor + ' / ' + g.total + '<br><b>Penempatan</b>: ' + esc_(g.place) + '</td></tr></table>' +
    '<p>Per level: ' + LV.map(l => l + ' = ' + g.blok[l] + '/' + g.tot[l]).join(' &nbsp; ') + '</p>' +
    '<table style="width:100%;border-collapse:collapse" border="1" cellpadding="4"><tr style="background:#e8edf8"><th>No</th><th>Level</th><th>Pertanyaan</th><th>Jawaban</th>' + (full ? '<th>Kunci</th><th>Hasil</th>' : '') + '</tr>' + rows + '</table>' +
    (d.tulis ? '<h3>Tugas menulis</h3><div style="border:1px solid #ccc;padding:8px">' + esc_(d.tulis) + '</div>' : '');
}
function wrap_(body) { return '<html><body style="font-family:Arial,sans-serif;font-size:10pt;color:#12203d">' + body + '</body></html>'; }
function pdf_(d, full) {
  const html = wrap_(frag_(d, full, cfg_(), qs_()));
  const blob = Utilities.newBlob(html, 'text/html', 'a.html').getAs('application/pdf');
  const nm = String(d.nama || 'peserta').replace(/[^\w]+/g, '_');
  return { name: 'Jawaban_' + nm + '_' + String(d.nim || '').replace(/\W/g, '') + '.pdf', b64: Utilities.base64Encode(blob.getBytes()) };
}
/** Admin: semua peserta dalam satu PDF (satu peserta per halaman). */
function adminPdfAll(pin) {
  chk_(pin);
  const c = cfg_(), qs = qs_(), rows = rSh_().getDataRange().getDisplayValues().slice(1);
  if (!rows.length) throw new Error('Belum ada hasil untuk diunduh.');
  const body = rows.map((r, i) => (i ? '<div style="page-break-before:always"></div>' : '') +
    frag_({ waktu: r[0], nama: r[1], nim: String(r[2]).replace(/^'/, ''), kelas: r[3], tulis: r[12], jawab: JSON.parse(r[13] || '{}') }, true, c, qs)).join('');
  const blob = Utilities.newBlob(wrap_(body), 'text/html', 'a.html').getAs('application/pdf');
  return { name: 'Jawaban_semua_mahasiswa.pdf', b64: Utilities.base64Encode(blob.getBytes()) };
}
/** Untuk mahasiswa: jawaban sendiri, tanpa kunci. */
function pdfSelf(d) { d.waktu = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd MMM yyyy HH:mm'); return pdf_(d, false); }
/** Untuk admin: lengkap dengan kunci dan penilaian per soal. */
function adminPdf(pin, r) {
  chk_(pin);
  return pdf_({ waktu: r[0], nama: r[1], nim: String(r[2]).replace(/^'/, ''), kelas: r[3], tulis: r[12], jawab: JSON.parse(r[13] || '{}') }, true);
}

/* ---------- Admin ---------- */
function chk_(pin) { if (String(pin) !== String(cfg_().pin)) throw new Error('PIN salah.'); }
function adminLogin(pin) { chk_(pin); return true; }
function adminData(pin) {
  chk_(pin);
  const res = rSh_().getDataRange().getDisplayValues().slice(1).reverse();
  return { cfg: cfg_(), qs: qs_(), res, url: ss_().getUrl() };
}
function adminSaveCfg(pin, obj) {
  chk_(pin);
  const sh = cfgSh_(), keys = Object.keys(DEF);
  sh.clearContents().getRange(1, 1, 1, 2).setValues([['Kunci', 'Nilai']]);
  sh.getRange(2, 1, keys.length, 2).setValues(keys.map(k => [k, obj[k] !== undefined ? obj[k] : DEF[k]]));
  return true;
}
function adminSaveQs(pin, arr) {
  chk_(pin);
  const sh = qSh_();
  sh.getRange(2, 1, Math.max(sh.getLastRow(), 2), 9).clearContent();
  const rows = arr.map((q, i) => [i + 1, q.level, q.bacaan || '', q.q, q.o[0], q.o[1], q.o[2], q.o[3], q.key]);
  if (rows.length) sh.getRange(2, 1, rows.length, 9).setValues(rows);
  return rows.length;
}
function adminClearRes(pin) {
  chk_(pin);
  const sh = rSh_();
  if (sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1);
  return true;
}
