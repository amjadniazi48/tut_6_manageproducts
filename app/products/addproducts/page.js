import React from "react";
import { getAuthToken } from "@/services/get-token";
//getting the token

const AddProducts = async () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const authToken = await getAuthToken();
  if (!authToken) {
    setError("Token is not present");
  }
  const handleSubmit = async (e) => {
    const addedProduct = { tite, description, category, price };
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(addedProduct),
    };

    const response = await fetch(`${API_URL}/api/products`, requestOptions);
    const evt = await response.json();

    if (!response.ok) {
      if (res.status === 403 || res.status === 401) {
        setError("UnAuthorized");
        return;
      } else {
        setError("Something Went Wrong");
      }
      setMessage("A new product has been submitted successfully !", {});
      router.push(`/products`);
    }
  };
  return (
    <div
      className="container bg-light col-md-6"
      style={{ marginTop: "10%", padding: "35px" }}
    >
      <h3 className="text-center text-primary">Ad Products</h3>
      <div className="text-danger">{error}</div>
      <div className="text-success">{error}</div>
      <form onSubmit={handleSubmit}>
        <div>{error}</div>
        <div>
          <label htmlFor="name">Product Title</label>
          <input
            type="text"
            name="title"
            id="name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="performers">Product Description</label>
          <textarea
            type="text"
            name="description"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <select
            id="titleSelect"
            value={category}
            onChange={(e) => setCategory(e.target.value)} // Inline onChange handler
          >
            <option value="">--Please choose a category--</option>
            <option value="Mr">SUV</option>
            <option value="Mrs">Sedan.</option>
            <option value="Ms">Hatchback.</option>
          </select>
        </div>
        <div>
          <label htmlFor="name">Price</label>
          <input
            type="text"
            name="price"
            id="name"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <input type="submit" value="Add Event" className="btn" />
      </form>
    </div>
  );
};

export default AddProducts;
