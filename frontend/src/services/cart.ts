const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function getCart(token?: string) {
  const res = await fetch(`${API_BASE_URL}/api/cart`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
}

export async function mergeCart(
  items: Array<{ product: string; quantity: number }>,
  token?: string
) {
  const res = await fetch(`${API_BASE_URL}/api/cart/merge`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ items }),
  });
  return res.json();
}

export async function addOrUpdateItem(
  productId: string,
  quantity?: number,
  token?: string
) {
  const res = await fetch(`${API_BASE_URL}/api/cart/items`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ productId, quantity }),
  });
  return res.json();
}

export async function updateQuantity(
  productId: string,
  quantity: number,
  token?: string
) {
  const res = await fetch(`${API_BASE_URL}/api/cart/items/${productId}`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ quantity }),
  });
  return res.json();
}

export async function removeItem(productId: string, token?: string) {
  const res = await fetch(`${API_BASE_URL}/api/cart/items/${productId}`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
}

export async function clearCart(token?: string) {
  const res = await fetch(`${API_BASE_URL}/api/cart`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
}


