
// Admin utility functions
export const ADMIN_USER_ID = 'fb88dcbf-6b5f-4531-8eb7-86c8018d3dac';
export const ADMIN_EMAIL = 'cynthiaonuohaa@gmail.com';

export const isAdminUser = (userId: string | undefined, userEmail?: string | null): boolean => {
  console.log('🔍 Checking admin status for:', { userId, userEmail });
  console.log('🔑 Admin ID:', ADMIN_USER_ID);
  console.log('📧 Admin Email:', ADMIN_EMAIL);
  
  const isAdminById = userId === ADMIN_USER_ID;
  const isAdminByEmail = userEmail === ADMIN_EMAIL;
  
  console.log('✅ Admin check results:', { isAdminById, isAdminByEmail });
  
  return isAdminById || isAdminByEmail;
};

export const isAdminEmail = (email: string | undefined): boolean => {
  return email === ADMIN_EMAIL;
};
