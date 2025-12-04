export const mapUserToResponse = (user: any) => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    address: user.address,
    isVerified: user.is_verified,
    status: user.status,
    positiveReviews: user.positive_reviews,
    negativeReviews: user.negative_reviews,
    password: user.password,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};