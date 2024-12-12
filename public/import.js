document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  document.getElementById("loading").style.display = "block";

  const formData = new FormData(e.target);

  try {
    const response = await fetch("/import", {
      method: "POST",
      body: formData,
      headers: {
        'Accept': 'multipart/form-data'
      }
    });

    const data = await response.json();
    document.getElementById("loading").style.display = "none";
    const resultElement = document.getElementById("result");

    if (data.errors.length > 0) {
      let errorMessages = "<ul>";
      data.errors.forEach(error => {
        errorMessages += `<li>${error}</li>`;
      });
      errorMessages += "</ul>";
      resultElement.innerHTML = `
        <p><strong>Records processed:</strong> ${data.process}</p>
        <p><strong>Records inserted successfully:</strong> ${data.success}</p>
        <p><strong>Records not inserted:</strong> ${data.failed}</p><br>
        <p><strong>Errors:</strong></p>
        ${errorMessages}
      `;
    } else {
      resultElement.innerHTML = `
        <p><strong>Total records processed:</strong> ${data.process}</p>
        <p><strong>Success:</strong> ${data.success}</p>
        <p><strong>Failed:</strong> ${data.failed}</p>
      `;
    }
  } catch (err) {
    console.error("Error:", err);
    document.getElementById("result").innerText = `Error: ${err.message}`;
  }
});