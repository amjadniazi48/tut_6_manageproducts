"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "@/config/index";

const AddProducts = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]); // Initialize as an empty array
  const [price, setPrice] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        if (Array.isArray(data.data)) {
          setCategories(data.data); // Set categories only if data.data is an array
        } else {
          throw new Error("Categories data is not an array");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Could not load categories");
      }
    };

    fetchCategories();
  }, []);

  // Log categories after they are updated
  useEffect(() => {
    console.log(categories);
  }, [categories]);

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (selectedFiles.length === 0) {
      alert("Please select at least one file.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", price);

    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i]);
    }
// Log FormData entries
for (let pair of formData.entries()) {
  console.log(`${pair[0]}: ${pair[1]}`);
}
    setIsUploading(true);

    try {
      const response = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });
    
      const result = await response.json();
      console.log("Response object:", response); // Check the full response
      console.log("Result:", result); // Check the parsed JSON result
    
      if (!response.ok) {
        throw new Error(result.message || "Failed to upload images"); // Use server-provided error message if available
      }
    
      console.log("Upload successful:", result);
      setMessage("Product and images uploaded successfully!");
      setError("");
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("There was an error uploading the images.");
      setMessage("");
    } finally {
      setIsUploading(false);
    }
    
  };

  return (
    <div
      className="container bg-light col-md-6"
      style={{ marginTop: "10%", padding: "35px" }}
    >
      <h3 className="text-center text-primary">Add Products</h3>
      <div className="text-danger">{error}</div>
      <div className="text-success">{message}</div>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            className="form-control mb-2"
            name="title"
            placeholder="Title"
            id="name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="description">Product Description</label>
          <textarea
            type="text"
            className="form-control mb-2"
            name="description"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="category">Category</label>
          <select
            id="category"
            className="form-control mb-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">--Please choose a category--</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.title}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <input
            type="text"
            className="form-control mb-2"
            name="price"
            placeholder="Price"
            id="price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="images">Upload Images</label>
          <input
            type="file"
            className="form-control mb-2"
            name="images"
            accept="image/*"
            multiple
            onChange={handleFileChange}
          />
        </div>
        <input
          type="submit"
          value={isUploading ? "Uploading..." : "Add Product"}
          className="btn btn-primary"
          disabled={isUploading}
        />
      </form>
    </div>
  );
};

export default AddProducts;
