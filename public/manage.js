async function postCustomerData(customerArray) {
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "";

  try {
    if (customerArray.length === 0) {
      outputDiv.innerHTML = '<p class="error-message">No records found !</p>';
      return;
    }

    const tableContainer = document.createElement("div");
    tableContainer.className = "table-responsive-sm";

    const table = document.createElement("table");
    table.className = "table table-hover";
    table.innerHTML = `
      <thead>
        <tr>
          <th>ID</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>State</th>
          <th>Sales YTD</th>
          <th>Prev Years Sales</th>
          <th class="d-print-none">
            <a class="btn btn-sm btn-success" href="/create">Add</a>
          </th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    customerArray.forEach((customer) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${customer.cusid}</td>
        <td>${customer.cusfname}</td>
        <td>${customer.cuslname}</td>
        <td>${customer.cusstate}</td>
        <td>${customer.cussalesytd}</td>
        <td>${customer.cussalesprev}</td>
        <td class="d-print-none">
          <a class="btn btn-sm btn-warning" href="/edit/${customer.cusid}">Edit</a>
          <a class="btn btn-sm btn-danger" href="/delete/${customer.cusid}">Delete</a>
        </td>
      `;
      tbody.appendChild(row);
    });

    tableContainer.appendChild(table);
    outputDiv.appendChild(tableContainer);

  } catch (error) {
    outputDiv.innerHTML = `<p class="error-message">Error: ${error.message}</p>`;
  }
}

document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target).entries());
  const params = Object.entries(formData).map(([k, v]) => `${k}=${v}`).join('&');
  const path = ['/api/manage', params].filter(Boolean).join('?');

  fetch(path, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  })
  .then(response => response.json())
  .then(data => {
    console.log('Réponse du serveur:', data);
    postCustomerData(data);
  })
  .catch(error => {
    console.error('Erreur:', error);
  });
});