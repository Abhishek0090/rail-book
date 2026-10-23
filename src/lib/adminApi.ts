// Shared wrapper for admin-only JSON API routes.
import { getAdminSession } from "@/lib/adminAuth";
import { MutationError } from "@/data/mutations";

export async function adminRoute(work: () => unknown, status = 201) {
  if (!(await getAdminSession())) {
    return Response.json({ error: "Admin login required" }, { status: 401 });
  }
  try {
    return Response.json(work(), { status });
  } catch (error) {
    if (error instanceof MutationError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    // Missing or wrongly typed fields in the JSON body.
    if (error instanceof TypeError) {
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
    throw error;
  }
}
