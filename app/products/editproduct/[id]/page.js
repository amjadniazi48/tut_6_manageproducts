"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/config/index";

const EditProduct = ({ params }) => {
  const { id } = params;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [price, setPrice] = useState("");
  const [existingImages, setExistingImages] = useState([]); // Initialize as an empty array
  const [newImages, setNewImages] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products?filters[id][$eq]=${id}&populate[images][fields][0]=name&populate[images][fields][1]=url&pagination[pageSize]=10&pagination[page]=1&status=published&locale[0]=en`);
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }
        const data = await response.json();
        const product = data.data[0];
            console.log("This is the place where data is",product);
        setTitle(product.title || "");
        setDescription(product.description || "");
        setCategory(product.categories && product.categories.length > 0 ? product.categories[0].id : "");
        setPrice(product.price || "");
        setExistingImages(product.images || []); // Safeguard against undefined images
      } catch (error) {
        console.error("Error fetching product details:", error);
        setError("Could not load product details");
      }
    };

    fetchProduct();
  }, [id]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories`);
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data.data || []); // Ensure categories is an array
      } catch (error) {
        console.error("Error fetching categories:", error);
        setError("Could not load categories");
      }
    };

    fetchCategories();
  }, []);

  // Handle file selection for new images
  const handleFileChange = (event) => {
    setNewImages(event.target.files);
  };

  // Handle form submission to save changes
  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      // Step 1: Update product details
      const productResponse = await fetch(`${API_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            title,
            description,
            categories: [category],
            price,
          },
        }),
      });

      if (!productResponse.ok) {
        const errorData = await productResponse.json();
        throw new Error(errorData.error.message || "Failed to update product");
      }

      // Step 2: If new images are selected, upload them
      if (newImages.length > 0) {
        const formData = new FormData();
        for (let i = 0; i < newImages.length; i++) {
          formData.append("files", newImages[i]);
        }
        formData.append("ref", "api::product.product");
        formData.append("refId", id);
        formData.append("field", "images");

        const uploadResponse = await fetch(`${API_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error.message || "Failed to upload images");
        }
      }

      setMessage("Product updated successfully!");
      setError("");
    } catch (error) {
      console.error("Error:", error);
      setError(error.message || "There was an error processing your request.");
      setMessage("");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle image replacement
  const handleImageReplace = (imageId) => {
    setExistingImages(existingImages.filter((image) => image.id !== imageId));
  };

  return (
    <div className="container bg-light col-md-6" style={{ marginTop: "10%", padding: "35px" }}>
      <h3 className="text-center text-primary">Edit Product</h3>
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
            id="categories"
            name="categories"
            className="form-control mb-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">--Please choose a category--</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
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
          <label>Existing Images</label>
          <div className="mb-2">
            {Array.isArray(existingImages) && existingImages.length > 0 ? (
              existingImages.map((image) => (
                <div key={image.id} className="mb-2">
                  <img
                    src={`${API_URL}${image.url}`}
                    alt={image.name}
                    style={{ width: "100px", height: "100px" }}
                  />
                  <button
                    type="button"
                    className="btn btn-danger btn-sm ml-2"
                    onClick={() => handleImageReplace(image.id)}
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <p>No images available</p>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="images">Replace Images</label>
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
          value={isSaving ? "Saving..." : "Save Changes"}
          className="btn btn-primary"
          disabled={isSaving}
        />
      </form>
    </div>
  );
};

export default EditProduct;
