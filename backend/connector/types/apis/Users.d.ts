declare global {
  namespace Users {
    interface User {
			id: number
			name: string
			full_name: string
			email: string
			phone: string
		}
		type ListMethod = () => Promise<User[]>
		type InfoMethod = (uuid: User['name']) => Promise<User | null>
		interface New extends Omit<User, 'id'> {
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
		type CreateMethod = (newUser: Users.New) => Promise<true | CreateMethodResult>
		type UpdateMethod = (uuid: User['name'], data: Partial<Omit<User, 'uuid'>>) => Promise<true | UpdateMethodResult>
		type DeleteMethod = (uuid: User['name']) => Promise<void>
		interface AssignAppMethodResult {
			code: 'user-not-exist',
      message: string
		}
		interface UnassignAppMethodResult {
			code: 'user-not-exist',
      message: string
		}
		type AssignAppMethod = (name: User['name'], package_name: Apps.App['package_name']) => Promise<true | AssignAppMethodResult>
		type UnassignAppMethod = (name: User['name'], package_name: Apps.App['package_name']) => Promise<true | UnassignAppMethodResult>
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