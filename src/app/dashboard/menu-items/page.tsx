
"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit3, UploadCloud, ToggleLeft, ToggleRight, X } from "lucide-react";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";
import type { Pizza } from "@/lib/types";
import { toast } from "sonner";

export default function MenuItemsPage() {
  const [items, setItems] = useState<Pizza[]>([]);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Pizza | null>(null);
  const [editing, setEditing] = useState<Pizza | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Classic Pizzas");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("599");
  const [location, setLocation] = useState("Dhanmondi, Dhaka");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteItem, setDeleteItem] = useState<Pizza | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function load() {
    try {
      const r = await api<{ items: Pizza[] }>("/api/menu/mine");
      setItems(r.items || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load menu items");
    }
  }

  useEffect(() => {
    load();

    if (new URLSearchParams(window.location.search).get("add") === "1") {
      setOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  // Close delete modal with Escape key
  useEffect(() => {
    if (!deleteItem) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape" && !deleteBusy) setDeleteItem(null);
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [deleteItem, deleteBusy]);

  function reset() {
    setOpen(false);
    setEditing(null);
    setName("");
    setCategory("Classic Pizzas");
    setDescription("");
    setPrice("599");
    setLocation("Dhanmondi, Dhaka");
    setFiles([]);
    setError("");
  }

  function edit(item: Pizza) {
    setEditing(item);
    setName(item.itemName);
    setCategory(item.category);
    setDescription(item.description);
    setPrice(String(item.price));
    setLocation(item.location);
    setFiles([]);
    setOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Description validation
    const trimmedDescription = description.trim();

    if (trimmedDescription.length < 10) {
      setError("Description must be at least 10 characters long.");
      return;
    }

    if (trimmedDescription.length > 1500) {
      setError("Description cannot exceed 1500 characters.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      let images = editing?.images || [];

      if (files.length) {
        if (files.length > 5) {
          throw new Error("You can upload up to 5 images.");
        }

        images = await Promise.all(
          files.map(async (file) => {
            const form = new FormData();
            form.append("image", file);

            const upload = await api<{ url: string }>("/api/uploads/menu-image", {
              method: "POST",
              body: form,
            });

            return upload.url;
          })
        );
      } else if (!editing) {
        throw new Error("Please select at least one menu image.");
      }

      const payload = {
        itemName: name,
        category,
        description: trimmedDescription,
        price: Number(price),
        location,
        images,
      };

      if (editing) {
        await api(`/api/menu/${editing._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/api/menu", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setNotice(
        editing
          ? "Menu item updated and sent for review."
          : "Menu item submitted for approval."
      );

      toast.success(editing ? "Menu item updated" : "Menu item submitted for approval");

      reset();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save item");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    if (!deleteItem || deleteBusy) return;

    setDeleteBusy(true);

    try {
      await api(`/api/menu/${deleteItem._id}`, {
        method: "DELETE",
      });

      setNotice("Menu item deleted.");
      toast.success("Menu item deleted");
      setDeleteItem(null);
      await load();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not delete item";
      toast.error(message);
      setError(message);
    } finally {
      setDeleteBusy(false);
    }
  }

  async function availability(item: Pizza) {
    try {
      await api(`/api/menu/${item._id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({
          isAvailable: item.isAvailable === false,
        }),
      });

      toast.success("Availability updated");
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update availability");
    }
  }

  return (
    <>
      <div className="dashboard-heading">
        <div>
          <span className="section-kicker">YOUR RESTAURANT MENU</span>
          <h1>
            My menu <em>items.</em>
          </h1>
          <p>New submissions and changes are reviewed by the PizzaHub admin team.</p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => {
            reset();
            setOpen(true);
          }}
        >
          <Plus size={17} /> Add menu item
        </button>
      </div>

      {notice && <p className="success-text">{notice}</p>}
      {error && !open && <p className="form-error">{error}</p>}

      {open && (
        <form className="panel add-item-form" onSubmit={submit}>
          <h2>{editing ? "Update menu item" : "Add a new menu item"}</h2>

          <div className="form-grid">
            <label>
              Item name
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>

            <label>
              Category
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {[
                  "Classic Pizzas",
                  "Vegetarian Pizzas",
                  "Meat Lovers",
                  "Specialty / Gourmet Pizzas",
                  "Sides & Appetizers",
                  "Beverages & Desserts",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>

            <label>
              Price (BDT)
              <input
                required
                type="number"
                min="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </label>

            <label>
              Location
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </label>

            <label className="span-two">
              Description
              <textarea
                required
                rows={3}
                minLength={10}
                maxLength={1500}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (error) setError("");
                }}
              />
              <small className="form-hint">
                Minimum 10 and maximum 1500 characters.
              </small>
            </label>

            <label className="span-two upload-field">
              <UploadCloud />{" "}
              {editing ? "Replace menu images (optional)" : "Menu images (required)"}

              <input
                required={!editing}
                multiple
                type="file"
                accept="image/*"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />

              <small className="form-hint">
                Select up to 5 images. Each file is uploaded to ImgBB.
              </small>
            </label>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
            <button className="btn btn-primary" disabled={busy}>
              {busy
                ? "Saving…"
                : editing
                  ? "Save changes"
                  : "Submit for approval"}
            </button>

            <button type="button" className="btn btn-outline" onClick={reset}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Approval</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.length ? (
                items.map((i) => (
                  <tr key={i._id}>
                    <td>{i.itemName}</td>
                    <td>{i.category}</td>
                    <td>{money(i.price)}</td>
                    <td>
                      <span className={`status status-${i.status}`}>
                        {i.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="table-action"
                        disabled={i.status !== "approved"}
                        onClick={() => availability(i)}
                      >
                        {i.isAvailable === false ? (
                          <>
                            <ToggleLeft size={15} /> Off
                          </>
                        ) : (
                          <>
                            <ToggleRight size={15} /> On
                          </>
                        )}
                      </button>
                    </td>

                    <td>
                      <button className="table-action" onClick={() => setPreview(i)}>
                        Preview
                      </button>

                      <button className="table-action" onClick={() => edit(i)}>
                        <Edit3 size={14} /> Edit
                      </button>

                      <button
                        className="table-action danger"
                        onClick={() => setDeleteItem(i)}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="table-empty">
                    Your menu items will appear here after submission.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {preview && (
        <div className="modal-backdrop" onClick={() => setPreview(null)}>
          <section
            className="panel order-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              onClick={() => setPreview(null)}
            >
              ×
            </button>

            <span className="section-kicker">YOUR MENU ITEM</span>
            <h2>{preview.itemName}</h2>

            {preview.images?.[0] && (
              <img
                className="order-details-image"
                src={preview.images[0]}
                alt={preview.itemName}
              />
            )}

            <p>{preview.description}</p>

            <div className="order-detail-grid">
              <div>
                <small>Category</small>
                <strong>{preview.category}</strong>
              </div>

              <div>
                <small>Price</small>
                <strong>{money(preview.price)}</strong>
              </div>

              <div>
                <small>Location</small>
                <strong>{preview.location}</strong>
              </div>

              <div>
                <small>Approval</small>
                <strong>{preview.status}</strong>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {deleteItem && (
        <div
          className="modal-backdrop"
          onClick={() => {
            if (!deleteBusy) setDeleteItem(null);
          }}
        >
          <section
            className="panel order-details-modal"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            aria-describedby="delete-modal-description"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="modal-close"
              aria-label="Close confirmation"
              disabled={deleteBusy}
              onClick={() => setDeleteItem(null)}
            >
              <X size={19} />
            </button>

            <div className="flex flex-col items-center text-center gap-4 py-5">
              <div className="flex items-center justify-center rounded-full bg-red-100 text-red-600 p-4">
                <Trash2 size={30} />
              </div>

              <div>
                <h2 id="delete-modal-title" className="text-xl font-semibold">
                  Delete menu item?
                </h2>

                <p
                  id="delete-modal-description"
                  className="mt-2 text-sm text-gray-500"
                >
                  Are you sure you want to delete{" "}
                  <strong>{deleteItem.itemName}</strong>? This action cannot be
                  undone.
                </p>
              </div>

              <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={deleteBusy}
                  onClick={() => setDeleteItem(null)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={deleteBusy}
                  onClick={confirmDelete}
                >
                  {deleteBusy ? (
                    "Deleting…"
                  ) : (
                    <>
                      <Trash2 size={15} /> Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
