import { createAuthenticatedClient } from "../../config/supabaseClient.js";
import type { User } from "../../types/supabase.js";
import type { UpdateUserDTO, CreateUserDTO } from "../model/User.js";
import { logger } from "../../config/logger.js";

export class UserService {
  async getUserInfo(userId: string, accessToken: string): Promise<User> {
    const log = logger.child({ userId, scope: "users.getProfile" });
    const supabase = createAuthenticatedClient(accessToken);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      log.error({ code: error.code, message: error.message }, "supabase.error");
      throw new Error(`Error user does not exist. ${error.message}`);
    }
    if (!data) throw new Error("User not found");

    log.debug("supabase.ok");
    return data;
  }

  async createUser(
    userData: CreateUserDTO,
    accessToken: string,
  ): Promise<User> {
    const log = logger.child({ userId: userData.id, scope: "users.create" });
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

    if (error) {
      log.error({ code: error.code, message: error.message }, "supabase.error");
      throw new Error(`Error creating user. ${error.message}`);
    }
    if (!data) throw new Error("User not created.");

    log.debug("supabase.ok");
    return data;
  }

  async updateUser(
    userId: string,
    updateData: UpdateUserDTO,
    accessToken: string,
  ): Promise<User> {
    const log = logger.child({ userId, scope: "users.updateProfile" });
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

    if (error) {
      log.error({ code: error.code, message: error.message }, "supabase.error");
      throw new Error(`Error updating user. ${error.message}`);
    }
    if (!data) throw new Error("User not found.");

    log.debug("supabase.ok");
    return data;
  }

  async disableUser(userId: string, accessToken: string): Promise<User> {
    const log = logger.child({ userId, scope: "users.disable" });
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

    if (error) {
      log.error({ code: error.code, message: error.message }, "supabase.error");
      throw new Error(`Error disabling user. ${error.message}`);
    }
    if (!data) throw new Error("User not found.");

    log.debug("supabase.ok");
    return data;
  }

  async deleteUser(userId: string, accessToken: string): Promise<User> {
    return this.disableUser(userId, accessToken);
  }
}

export default new UserService();
