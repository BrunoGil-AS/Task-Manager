import { createAuthenticatedClient } from "../../config/supabaseClient.js";
import type { User } from "../../types/supabase.js";
import type { UpdateUserDTO, CreateUserDTO } from "../model/User.js";

export class UserService {
  async getUserInfo(userId: string, accessToken: string): Promise<User> {
    const supabase = createAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw new Error(`Error user does not exist. ${error.message}`);
    if (!data) throw new Error("User not found");

    return data;
  }

  async createUser(
    userData: CreateUserDTO,
    accessToken: string,
  ): Promise<User> {
    const supabase = createAuthenticatedClient(accessToken);
    const insertData: Record<string, unknown> = {
      id: userData.id,
      name: userData.name,
      enabled: userData.enabled,
    };

    const { data, error } = await supabase
      .from("users")
      .insert(insertData as any)
      .select("*")
      .single();

    if (error) throw new Error(`Error creating user. ${error.message}`);
    if (!data) throw new Error("User not created.");

    return data;
  }

  async updateUser(
    userId: string,
    updateData: UpdateUserDTO,
    accessToken: string,
  ): Promise<User> {
    const supabase = createAuthenticatedClient(accessToken);
    const updatePayload: Record<string, unknown> = {
      name: updateData.name,
    };

    const { data, error } = await supabase
      .from("users")
      .update(updatePayload as any)
      .eq("id", userId)
      .select("*")
      .single();

    if (error) throw new Error(`Error updating user. ${error.message}`);
    if (!data) throw new Error("User not found.");

    return data;
  }

  async disableUser(userId: string, accessToken: string): Promise<User> {
    const supabase = createAuthenticatedClient(accessToken);
    const updatePayload: Record<string, unknown> = {
      enabled: false,
    };

    const { data, error } = await supabase
      .from("users")
      .update(updatePayload as any)
      .eq("id", userId)
      .select("*")
      .single();

    if (error) throw new Error(`Error disabling user. ${error.message}`);
    if (!data) throw new Error("User not found.");

    return data;
  }

  async deleteUser(userId: string, accessToken: string): Promise<User> {
    return this.disableUser(userId, accessToken);
  }
}

export default new UserService();
