# Facebook OAuth Integration - Agent Platform

## 📋 Overview

This document explains the Facebook OAuth integration added to the Agent Platform authentication system. The integration allows users to authenticate using both Google and Facebook accounts through AWS Cognito.

## 🎯 What Was Implemented

### **Dual OAuth Support**
- **Before**: Only Google OAuth authentication
- **After**: Google + Facebook OAuth authentication
- **Provider Support**: AWS Cognito with multiple identity providers

## 🏗️ Architecture Changes

### **1. Terraform Infrastructure Updates**

#### **New Variables (`terraform/backend/variables.tf`)**
```hcl
# Variables para Facebook OAuth
variable "facebook_client_id" {
  description = "Facebook App ID"
  type        = string
  sensitive   = true
}

variable "facebook_client_secret" {
  description = "Facebook App Secret"
  type        = string
  sensitive   = true
}
```

#### **Facebook Identity Provider (`terraform/backend/main.tf`)**
```hcl
# Facebook Identity Provider para Cognito
resource "aws_cognito_identity_provider" "facebook" {
  user_pool_id  = aws_cognito_user_pool.user_pool.id
  provider_name = "Facebook"
  provider_type = "Facebook"

  provider_details = {
    client_id        = var.facebook_client_id
    client_secret    = var.facebook_client_secret
    authorize_scopes = "email public_profile"
  }

  attribute_mapping = {
    email    = "email"
    username = "id"
    name     = "name"
    picture  = "picture"
  }
}
```

#### **Updated User Pool Client**
```hcl
# Supported identity providers - NOW INCLUDES FACEBOOK
supported_identity_providers = ["Google", "Facebook"]

# Updated dependencies
depends_on = [
  aws_cognito_identity_provider.google,
  aws_cognito_identity_provider.facebook
]
```

#### **New Terraform Output**
```hcl
output "facebook_identity_provider_name" {
  description = "Facebook Identity Provider Name"
  value       = aws_cognito_identity_provider.facebook.provider_name
}
```

### **2. GitHub Actions Integration**

#### **Updated Workflow (`.github/workflows/terraform-backend.yml`)**
```yaml
# Added Facebook OAuth variables to Terraform apply
-var="facebook_client_id=${{ secrets.FACEBOOK_CLIENT_ID }}" \
-var="facebook_client_secret=${{ secrets.FACEBOOK_CLIENT_SECRET }}" \
```

### **3. Component Placeholder**

#### **Created Component File**
- **File**: `app/components/SocialLoginButtons.tsx`
- **Status**: Empty placeholder for future UI implementation
- **Purpose**: Future component for Facebook login buttons

## 🔧 Technical Specifications

### **Facebook OAuth Configuration**

| Setting | Value | Description |
|---------|-------|-------------|
| **Provider Type** | `Facebook` | Facebook identity provider |
| **Scopes** | `email public_profile` | Access to email and basic profile |
| **Username Mapping** | `id` | Facebook user ID as username |
| **Email Mapping** | `email` | Facebook email address |
| **Name Mapping** | `name` | Facebook display name |
| **Picture Mapping** | `picture` | Facebook profile picture URL |

### **Security Features**

✅ **Sensitive Variables**: All Facebook credentials marked as `sensitive = true`  
✅ **Secure Scopes**: Limited to `email` and `public_profile` only  
✅ **GitHub Secrets**: Facebook credentials stored as encrypted secrets  
✅ **Attribute Mapping**: Secure mapping of Facebook profile data  

## 🚀 Deployment Status

### **Current Cognito Configuration**
- **User Pool ID**: `us-east-1_MeClCiUAC`
- **Domain**: `agent-auth-2sc4m5q6.auth.us-east-1.amazoncognito.com`
- **Supported Providers**: Google ✅, Facebook ⚠️ (pending secrets)

### **Deployment Pipeline**
- **Terraform Backend**: Updated with Facebook variables
- **GitHub Actions**: Ready for Facebook secrets
- **Infrastructure**: Configured for dual OAuth providers

## 📋 Setup Requirements

### **1. Facebook App Configuration**

To complete the Facebook OAuth integration, you need:

#### **Create Facebook App**
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create new app with "Consumer" use case
3. Add "Facebook Login" product
4. Configure OAuth settings

#### **Facebook App Settings**
```
App Name: Agent Platform
App Domain: agent-auth-2sc4m5q6.auth.us-east-1.amazoncognito.com
Valid OAuth Redirect URIs:
  https://agent-auth-2sc4m5q6.auth.us-east-1.amazoncognito.com/oauth2/idpresponse

Permissions Required:
  - email
  - public_profile
```

### **2. GitHub Secrets Configuration**

Add these secrets to your GitHub repository:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `FACEBOOK_CLIENT_ID` | Facebook App ID | `1234567890123456` |
| `FACEBOOK_CLIENT_SECRET` | Facebook App Secret | `abcdef1234567890abcdef1234567890` |

#### **How to Add Secrets**
1. Go to GitHub repo → Settings → Secrets and Variables → Actions
2. Click "New repository secret"
3. Add both `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET`

### **3. Deployment Process**

Once Facebook secrets are configured:

```bash
# The Terraform backend pipeline will automatically:
1. Detect new Facebook variables
2. Apply Terraform changes
3. Configure Facebook Identity Provider in Cognito
4. Update User Pool Client to support Facebook
```

## 🔍 Verification Steps

### **After Deployment, Verify:**

#### **1. Cognito Configuration**
```bash
# Check identity providers
aws cognito-idp list-identity-providers --user-pool-id us-east-1_MeClCiUAC

# Expected output should include both:
# - Google
# - Facebook
```

#### **2. User Pool Client**
```bash
# Check supported providers
aws cognito-idp describe-user-pool-client \
  --user-pool-id us-east-1_MeClCiUAC \
  --client-id 2sfsss72kin03gbilraa1pvlb5

# Should show: "SupportedIdentityProviders": ["Google", "Facebook"]
```

#### **3. Test OAuth URLs**

**Google OAuth URL:**
```
https://agent-auth-2sc4m5q6.auth.us-east-1.amazoncognito.com/oauth2/authorize?identity_provider=Google&...
```

**Facebook OAuth URL:**
```
https://agent-auth-2sc4m5q6.auth.us-east-1.amazoncognito.com/oauth2/authorize?identity_provider=Facebook&...
```

## 🎨 Frontend Integration (Future)

### **UI Components Needed**

The `SocialLoginButtons.tsx` component should include:

```tsx
// Example structure for future implementation
const SocialLoginButtons = () => {
  return (
    <div className="social-login-buttons">
      {/* Google Login Button */}
      <button onClick={() => signInWithGoogle()}>
        Continue with Google
      </button>
      
      {/* Facebook Login Button */}
      <button onClick={() => signInWithFacebook()}>
        Continue with Facebook
      </button>
    </div>
  )
}
```

### **AWS Amplify Integration**

Update Amplify configuration to support Facebook:

```tsx
// In _app.tsx or auth configuration
Amplify.configure({
  Auth: {
    // ... existing configuration
    oauth: {
      // ... existing oauth config
      // Facebook will be automatically available once Cognito is configured
    }
  }
})
```

## 🚨 Important Notes for Future Agents

### **⚠️ Current Status**
- **Infrastructure**: ✅ Ready for Facebook OAuth
- **Secrets**: ❌ Not configured yet
- **Facebook App**: ❌ Not created yet
- **UI Components**: ❌ Placeholder only

### **🔧 Next Steps Required**
1. Create Facebook App in Meta Developers
2. Add GitHub secrets for Facebook credentials
3. Implement UI components in `SocialLoginButtons.tsx`
4. Test Facebook OAuth flow end-to-end

### **🔐 Security Considerations**
- Facebook App should be in "Live" mode for production
- Regularly rotate Facebook App Secret
- Monitor OAuth callback URLs for security
- Validate Facebook user data on backend

### **📊 Monitoring**
- Track authentication success/failure rates
- Monitor user preference (Google vs Facebook)
- Log OAuth errors for debugging
- Set up CloudWatch alerts for auth failures

## 📚 Related Documentation

- **Google OAuth Setup**: See existing Cognito configuration
- **AWS Cognito Docs**: [Identity Providers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-identity-providers.html)
- **Facebook Login**: [Meta for Developers](https://developers.facebook.com/docs/facebook-login/)
- **Terraform AWS Provider**: [Cognito Identity Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cognito_identity_provider)

## 🎯 Success Criteria

The Facebook OAuth integration will be complete when:

- ✅ Facebook Identity Provider exists in Cognito
- ✅ Users can authenticate with Facebook accounts
- ✅ Facebook user data (name, email, picture) is properly mapped
- ✅ UI shows both Google and Facebook login options
- ✅ Error handling works for Facebook OAuth failures
- ✅ User experience is consistent between providers

---

**Last Updated**: August 1, 2025  
**Commit Hash**: `cb788f5`  
**Author**: Claude Code + Kiro.dev  
**Status**: Infrastructure Ready, Secrets Pending