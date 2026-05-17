import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImageToStorage } from "@/lib/imagen";

/**
 * POST /api/posts/[id]/upload-image
 * Body: FormData with field "file" (image file)
 * Uploads to Supabase Storage and saves imageUrl to post.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const post = await prisma.post.findFirst({
      where: {
        id,
        client: { agency: { userId: session.user.id } },
      },
      select: { id: true, clientId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate type
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, and WebP files are allowed." },
        { status: 400 }
      );
    }

    // 8MB limit (Meta's requirement)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 8MB." },
        { status: 400 }
      );
    }

    // Convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Determine extension
    const ext = file.type === "image/webp" ? "webp"
      : file.type === "image/png" ? "png"
      : "jpg";

    const fileName = `${post.clientId}/${post.id}-custom-${Date.now()}.${ext}`;

    let imageUrl: string;
    try {
      imageUrl = await uploadImageToStorage(buffer, fileName);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Save to post
    await prisma.post.update({
      where: { id },
      data: { imageUrl },
    });

    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("POST /api/posts/[id]/upload-image error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
