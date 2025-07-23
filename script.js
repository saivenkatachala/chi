const admins = ["9491358278","9121123345","9989634265",9492860750"];
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxZmYTlXGbNNlOc47MRz2vAUqbewTI9AatwZMxcHFntcD_KYgutaH3jSD3i9VPJ2Eh_/exec";

let allMembers = [];
let editIndex = null;

function login(){
  const u = document.getElementById('username').value.trim();
  if(admins.includes(u)){
    document.getElementById('loginBox').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    loadBatches(); loadWinners();
  } else alert('Invalid login');
}

function showSection(id){
  document.querySelectorAll('.section').forEach(s=>s.style.display='none');
  document.getElementById(id).style.display='block';
}

async function createBatch(){
  const name = document.getElementById('batchName').value.trim();
  if(!name) return alert('Enter name');
  await fetch(SCRIPT_URL,{method:'POST',body:JSON.stringify({action:'createBatch',batchName:name})});
  alert('Batch created');
  loadBatches();
}

async function addMember(){
  const d={
    action:'addMember',
    batch:document.getElementById('batchSelect').value,
    name:document.getElementById('memberName').value,
    phone:document.getElementById('phone').value,
    status:document.getElementById('paymentStatus').value,
    month:document.getElementById('chittiMonth').value,
    chittiStatus:document.getElementById('chittiStatus').value,
    amount:document.getElementById('amountPaid').value
  };
  await fetch(SCRIPT_URL,{method:'POST',body:JSON.stringify(d)});
  alert(`Member added for ${formatMonth(d.month)}`);
  loadMembers();
}

async function addWinner(){
  const d={
    action:'addWinner',
    batch:document.getElementById('winnerBatch').value,
    name:document.getElementById('winnerName').value,
    amount:document.getElementById('winnerAmount').value
  };
  await fetch(SCRIPT_URL,{method:'POST',body:JSON.stringify(d)});
  alert(`Winner added for ${formatMonth(new Date().toISOString().slice(0, 7))}`);
  loadWinners();
}

async function loadBatches(){
  const res=await fetch(`${SCRIPT_URL}?action=getBatches`);
  const batches=await res.json();
  ['batchSelect','viewBatchSelect','winnerBatch'].forEach(id=>{
    const el=document.getElementById(id);
    el.innerHTML=batches.map(b=>`<option>${b}</option>`).join('');
  });
}

async function loadMembers(){
  const batch = document.getElementById('viewBatchSelect').value;
  if(!batch) return;
  const res = await fetch(`${SCRIPT_URL}?action=viewMembersByBatch&batch=${batch}`);
  allMembers = await res.json();
  editIndex = null;
  displayMembers(allMembers);
}
function formatMonth(monthValue) {
    if (!monthValue) return 'Not Set';
    
    // If it's already in correct format (like "January 2023")
    if (typeof monthValue === 'string' && monthValue.match(/[a-zA-Z]/)) {
      return monthValue;
    }
    
    // If it's a timestamp or date string
    if (typeof monthValue === 'string' && !isNaN(Date.parse(monthValue))) {
      const date = new Date(monthValue);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    
    // If it's in format "MM-YYYY" or similar
    if (typeof monthValue === 'string' && monthValue.includes('-')) {
      const [month, year] = monthValue.split('-');
      const date = new Date(year, month-1);
      return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    }
    
    // Fallback return
    return monthValue;
  }
function displayMembers(arr){
  const tbody=document.querySelector('#membersTable tbody');
  tbody.innerHTML=arr.map((m,i)=>`
    <tr id="row${i}" class="${i===editIndex?'editRow':''}">
      <td>${i===editIndex? `<input id="e_name" value="${m.name}">`:m.name}</td>
      <td>${i===editIndex? `<input id="e_phone" value="${m.phone}">`:m.phone}</td>
      <td>${i===editIndex? `<input id="e_status" value="${m.status}">`:m.status}</td>
       <td>${i === editIndex ? `<input id="e_month" value="${m.month}">` : formatMonth(m.month)}</td>
      <td>${i===editIndex? `<input id="e_chittiStatus" value="${m.chittiStatus}">`:m.chittiStatus}</td>
      <td>${i===editIndex? `<input id="e_amount" value="${m.amount}">`:m.amount}</td>
      <td>${i===editIndex? `<i class="fa fa-check" onclick="saveEdit(${i})"></i>`:`<i class="fa fa-pen" onclick="startEdit(${i})"></i>`}</td>
      <td><i class="fa fa-trash" onclick="deleteMember(${i})"></i></td>
    </tr>`).join('');
}

function startEdit(i){
  editIndex = i;
  displayMembers(allMembers);
}

async function saveEdit(i){
  const batch = document.getElementById('viewBatchSelect').value;
  const updated = {
    name: document.getElementById('e_name').value,
    phone: document.getElementById('e_phone').value,
    status: document.getElementById('e_status').value,
    month: document.getElementById('e_month').value,
    chittiStatus: document.getElementById('e_chittiStatus').value,
    amount: document.getElementById('e_amount').value
  };
  await fetch(SCRIPT_URL, {method:'POST',
    body: JSON.stringify({action:'updateMember', batch, index: i, updated})
  });
  alert('Updated');
  editIndex = null;
  loadMembers();
}

async function deleteMember(i){
  if(!confirm('Delete this member?')) return;
  const batch = document.getElementById('viewBatchSelect').value;
  await fetch(SCRIPT_URL, {method:'POST',
    body: JSON.stringify({action:'deleteMember', batch, index: i})
  });
  alert('Deleted');
  loadMembers();
}

// function searchMembers() {
//     const key = document.getElementById('searchInput').value.trim().toLowerCase();
//     if (!key) {
//       displayMembers(allMembers); // Show all if search is empty
//       return;
//     }
    
//     const filtered = allMembers.filter(m => 
//       (m.name && m.name.toLowerCase().includes(key)) || 
//       (m.phone && m.phone.includes(key))
//     );
    
//     displayMembers(filtered);
//   }
function searchMembers() {
    const key = document.getElementById('searchInput').value.trim().toLowerCase();
    if (!key) {
      displayMembers(allMembers); // Show all if search is empty
      return;
    }

    const filtered = allMembers.filter(m =>
      (m.name && m.name.toLowerCase().includes(key)) ||
      (m.phone && String(m.phone).includes(key)) // Convert m.phone to string
    );

    displayMembers(filtered);
  }

async function loadWinners(){
  const res = await fetch(`${SCRIPT_URL}?action=winners`);
  const winners = await res.json();
  document.getElementById('alerts').innerHTML = winners.map(w=>
    `<div><strong>${w.batch}</strong>: ${w.name} - ₹${w.amount}</div>`).join('');
}

async function loadWinners(){
  const res = await fetch(`${SCRIPT_URL}?action=winners`);
  const winners = await res.json();
  document.getElementById('alerts').innerHTML = winners.map(w =>
    `<div><strong>${w.batch}</strong>: ${w.name} won ₹${w.amount} in ${formatMonth(w.month)}</div>`).join('');
}
