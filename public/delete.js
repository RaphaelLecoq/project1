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
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      alert("Customer deleted successfully.");
      document.getElementById("output").innerHTML = '<p>Customer deleted successfully !</p>';
    } else {
      const result = await response.json();
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error("Error deleting customer:", error);
    alert("An unexpected error occurred.");
  }
});

document.querySelector('input[value="Cancel"]').addEventListener("click", () => {
  window.location.href = "/manage";
});