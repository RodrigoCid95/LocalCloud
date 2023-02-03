import Service from "kernel/lib/Service"

export interface LoginService extends Service {
	login(): void
}