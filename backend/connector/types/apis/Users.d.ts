declare global {
  namespace Users {
    interface User {
			uuid: string
			full_name: string
			user_name: string
			photo: string
			email: string
			phone: string
		}
		type ListMethod = () => Promise<User[]>
		type InfoMethod = (uuid: User['uuid']) => Promise<User | null>
		interface NewUser {
			email?: string
			full_name: string
			phone?: string
			user_name: string
			password: string
		}
		interface CreateMethodResult {
			code: 'fields-required' | 'user-already-exists'
			message: string
		}
		interface UpdateMethodResult {
			code: 'user-already-exists'
			message: string
		}
		type CreateMethod = (newUser: NewUser) => Promise<true | CreateMethodResult>
		type UpdateMethod = (uuid: User['uuid'], data: Partial<Omit<User, 'uuid'>>) => Promise<true | UpdateMethodResult>
		type DeleteMethod = (uuid: User['uuid']) => Promise<void>
		interface AssignAppMethodResult {
			code: 'user-not-exist',
      message: string
		}
		interface UnassignAppMethodResult {
			code: 'user-not-exist',
      message: string
		}
		type AssignAppMethod = (uuid: User['uuid'], package_name: Apps.App['package_name']) => Promise<true | AssignAppMethodResult>
		type UnassignAppMethod = (uuid: User['uuid'], package_name: Apps.App['package_name']) => Promise<true | UnassignAppMethodResult>
		interface Connector {
			list: ListMethod
			info: InfoMethod
			create: CreateMethod
			update: UpdateMethod
			delete: DeleteMethod
			assignApp: AssignAppMethod
			unassignApp: UnassignAppMethod
		}
  }
}

export {}