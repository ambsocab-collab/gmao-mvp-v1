import { faker } from '@faker-js/faker';

export class UserFactory {
  private createdUsers: string[] = [];

  async createUser(overrides = {}) {
    const user = {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: faker.internet.password({ length: 12 }),
      ...overrides,
    };

    // TODO: Implement actual user creation via Supabase Admin or API
    // const { data, error } = await supabaseAdmin.auth.admin.createUser({...});
    
    // For scaffold, we just return the object
    console.log('Simulating user creation:', user.email);
    
    // Simulate ID
    const userId = faker.string.uuid();
    this.createdUsers.push(userId);
    
    return { id: userId, ...user };
  }

  async cleanup() {
    // Delete all created users
    console.log('Cleaning up users:', this.createdUsers.length);
    // TODO: Implement cleanup via Supabase Admin
    this.createdUsers = [];
  }
}
