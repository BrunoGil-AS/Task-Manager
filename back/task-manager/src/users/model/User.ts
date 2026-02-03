export default interface UserDTO {
  id: string;
  name: string;
}
export interface CreateUserDTO {
  id: string;
  name: string;
  enabled: boolean;
}

export interface UpdateUserDTO {
  name: String;
}
