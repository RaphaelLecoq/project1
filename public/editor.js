document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = Object.fromEntries(new FormData(e.target).entries());
  const id = formData.id;

  if (!id) {
    alert("Customer ID is required.");
    return;
  }

  try {
    const response = await fetch(`/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstname: formData.firstname,
        lastname: formData.lastname,
        state: formData.state,
        sales: formData.sales,
        previous: formData.previous
      })
    });


    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    if (response.ok) {
      alert("Customer updated successfully!");
    } else {
      const result = await response.json();
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("There was an error updating the customer.");
  }
});


document.querySelector('input[value="Cancel"]').addEventListener("click", () => {
  window.location.href = "/manage";
});