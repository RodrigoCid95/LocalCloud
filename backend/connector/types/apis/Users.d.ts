declare global {
  namespace Users {
    interface User {
			uid: number
			name: string
			full_name: string
			email: string
			phone: string
		}
		type ListMethod = () => Promise<User[]>
		type InfoMethod = (uid: User['uid']) => Promise<User | null>
		interface New extends Omit<User, 'uid'> {
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
		type UpdateMethod = (uid: User['uid'], data: Partial<Omit<Omit<User, 'uid'>, 'name'>>) => Promise<true | UpdateMethodResult>
		type DeleteMethod = (uid: User['uid']) => Promise<void>
		interface AssignAppMethodResult {
			code: 'user-not-exist',
      message: string
		}
		interface UnassignAppMethodResult {
			code: 'user-not-exist',
      message: string
		}
		type AssignAppMethod = (uid: User['uid'], package_name: Apps.App['package_name']) => Promise<true | AssignAppMethodResult>
		type UnassignAppMethod = (uid: User['uid'], package_name: Apps.App['package_name']) => Promise<true | UnassignAppMethodResult>
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