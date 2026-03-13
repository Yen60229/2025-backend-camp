import request from "./request.js";

export function createOrder(creditPackageId) {
  return request.post(`orders/${creditPackageId}`);
}
