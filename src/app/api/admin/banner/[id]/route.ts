import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type PageProps = Promise<{id: string}>

export async function GET(request: NextRequest, props : {params : PageProps}) {
  const {id} = await props.params
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const banner = await db.banner.findUnique({
      where: {
        id,
      },
    });
    
    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }
    
    return NextResponse.json({ banner }, { status: 200 });
  } catch (error) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(
      { error: "Failed to fetch banner" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, props : {params : PageProps}) {
  const {id} = await props.params
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { title, description, bannerImg, link, active } = body;
    
    if (!title || !bannerImg) {
      return NextResponse.json(
        { error: "Title and banner image are required" },
        { status: 400 }
      );
    }
    
    const banner = await db.banner.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        bannerImg,
        link,
        active,
      },
    });
    
    return NextResponse.json({ banner }, { status: 200 });
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest,props : {params : PageProps}) {
  const {id} = await props.params
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await db.banner.delete({
      where: {
        id,
      },
    });
    
    return NextResponse.json({ message: "Banner deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting banner:", error);
    return NextResponse.json(
      { error: "Failed to delete banner" },
      { status: 500 }
    );
  }
} 