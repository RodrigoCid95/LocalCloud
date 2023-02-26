import Service from "kernel/lib/Service"

export interface LoginService extends Service {
	login(credential: Credential): void
}
export type Credential = {
	name: string
	password: string
}