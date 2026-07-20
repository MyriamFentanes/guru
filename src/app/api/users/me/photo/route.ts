import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/rbac";
import { updateUserPhoto } from "@/lib/users";
import { extractImageUpload, imageExtension, ImageValidationError } from "@/lib/image-upload";
import { writeBinaryFile } from "@/lib/storage/file-store";
import { userPhotoPath } from "@/lib/storage/paths";

export const POST = withAuth(async (session, req) => {
  const form = await req.formData();

  let image;
  try {
    image = await extractImageUpload(form.get("photo"));
  } catch (err) {
    if (err instanceof ImageValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
  if (!image) {
    return NextResponse.json({ error: "photo is required" }, { status: 400 });
  }

  const filename = `photo.${imageExtension(image)}`;
  await writeBinaryFile(userPhotoPath(session.userId, filename), image.buffer);
  const user = await updateUserPhoto(session.userId, filename);
  return NextResponse.json({ photo: user?.photo });
});
