import type { Request, Response } from "express";
import type { Gender } from "../../generated/prisma/enums.js";
import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcryptjs";
import { uploadImage } from "../services/cloudinaryService.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import type { Prisma } from "../../generated/prisma/client.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//create a user
interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender?: Gender;
}

export const createUser = async (
  req: Request<{}, {}, CreateUserBody>,
  res: Response,
) => {
  try {
    const { name, email, password, confirmPassword, gender } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({
        errorMessage: "Provide email, password and name.",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        errorMessage: "Passwords do not match.",
      });
    }
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Invalid Credentials." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let imageUrl: string | undefined;
    let imagePublicId: string | undefined;

    if (req.file) {
      const { secure_url, public_id } = await uploadImage(req.file.buffer);
      imageUrl = secure_url;
      imagePublicId = public_id;
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gender: gender ?? null,
        ...(imageUrl && { image: imageUrl }),
        ...(imagePublicId && { imagePublicId }),
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

//login
interface LoginBody {
  email: string;
  password: string;
}

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Provide email and password." });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (!user.password) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    const payload = {
      userId: user.id,
      email: user.email,
    };

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET as string, {
      algorithm: "HS256",
      expiresIn: "7d",
    });

    return res.status(200).json({
      authToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error during login",
    });
  }
};

//get logged user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    if (!req.payload) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.payload!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        image: true,
        provider: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching user.",
    });
  }
};

//update/edit user
interface UpdateUserBody {
  name?: string;
  gender?: Gender;
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
}

export const updateUser = async (
  req: Request<{}, {}, UpdateUserBody>,
  res: Response,
) => {
  try {
    if (!req.payload) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const userId = req.payload!.userId;
    const { name, gender, currentPassword, newPassword, confirmNewPassword } =
      req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const updateData: Prisma.UserUpdateInput = {};

    //update name
    if (name !== undefined) updateData.name = name;

    //update genre
    if (gender !== undefined) updateData.gender = gender;

    //update password
    if (newPassword || confirmNewPassword) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return res.status(400).json({
          message:
            "Current password, new password and confirmation are required.",
        });
      }
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
          message: "New passwords do not match.",
        });
      }
      if (!user.password) {
        return res.status(400).json({
          message: "Password change not allowed for OAuth users.",
        });
      }
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password as string,
      );
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Current password is incorrect.",
        });
      }
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    //update image
    if (req.file) {
      const { secure_url, public_id } = await uploadImage(req.file.buffer);
      //delete old image
      if (user.imagePublicId) {
        await cloudinary.uploader.destroy(user.imagePublicId);
      }

      updateData.image = secure_url;
      updateData.imagePublicId = public_id;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "No data provided to update.",
      });
    }

    const updateUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        image: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json(updateUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error updating user.",
    });
  }
};

//delete user
interface DeleteUserBody {
  password: string;
}

export const deleteUser = async (
  req: Request<{}, {}, DeleteUserBody>,
  res: Response,
) => {
  try {
    if (!req.payload) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const userId = req.payload!.userId;
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        message: "Password is required to delete account",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    //if GOOGLE
    if (!user.password) {
      return res.status(400).json({
        message: "OAuth users must confirm identity via Google.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    //delete image from Cloudinary
    if (user.imagePublicId) {
      await cloudinary.uploader.destroy(user.imagePublicId);
    }

    await prisma.user.delete({
      where: {
        id: userId,
      },
    });

    return res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error deleting user.",
    });
  }
};

//google login
interface GoogleLoginBody {
  idToken: string;
}

export const googleLogin = async (
  req: Request<{}, {}, GoogleLoginBody>,
  res: Response,
) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "idToken is required." });
    }
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId) {
      return res.status(500).json({ message: "Google auth not configured." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ message: "Invalid Google token." });
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;
    const emailVerified = payload.email_verified;

    if (!googleId || !email) {
      return res.status(400).json({ message: "Invalid Google payload." });
    }

    if (!emailVerified) {
      return res.status(401).json({ message: "Google email not verified." });
    }
    const googleIdValue: string = googleId;
    const emailValue: string = email;

    let user = await prisma.user.findUnique({
      where: { googleId: googleIdValue },
    });

    if (!user) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email: emailValue },
      });

      if (existingByEmail) {
        user = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: {
            googleId: googleIdValue,
            ...(picture && { image: picture }),
          },
        });
      } else {
        const fallbackName = emailValue.split("@")[0] ?? "Google User";
        user = await prisma.user.create({
          data: {
            name: name ?? fallbackName,
            email: emailValue,
            password: null,
            provider: "GOOGLE",
            googleId: googleIdValue,
            ...(picture && { image: picture }),
          },
        });
      }
    }

    const authPayload = {
      userId: user.id,
      email: user.email,
    };

    const authToken = jwt.sign(
      authPayload,
      process.env.TOKEN_SECRET as string,
      {
        algorithm: "HS256",
        expiresIn: "7d",
      },
    );

    return res.status(200).json({
      authToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    console.error(error);

    // Google token validation/auth errors
    if (
      error instanceof Error &&
      (error.message.includes("Token used too late") ||
        error.message.includes("Wrong number of segments") ||
        error.message.includes("Invalid token signature") ||
        error.message.includes("No pem found") ||
        error.message.includes("audience") ||
        error.message.includes("Invalid token"))
    ) {
      return res.status(401).json({ message: "Invalid Google token." });
    }

    // Internal/server errors
    return res.status(500).json({ message: "Error during Google login." });
  }
};
