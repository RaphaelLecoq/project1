document.getElementById("form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const customerData = Object.fromEntries(formData.entries());

  try {
    const response = await fetch("/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(customerData)
    });

    const result = await response.json();
    console.log(result);

    if (!response.ok)
      throw new Error(result.message);

    document.getElementById("output").innerHTML = '<p>New customer created !</p>';
    alert("Customer added successfully!");
  } catch (e) {
    console.error("Error:", e);
    document.getElementById("output").innerText = `Error: ${e.message}`;
    alert("There was an error adding the customer.");
  }
});