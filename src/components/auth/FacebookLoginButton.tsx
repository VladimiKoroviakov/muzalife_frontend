import { useState } from 'react';
import imgFacebookLogo from "../../assets/images/Facebook-logo.png";
import { useAuth } from "../../hooks/useAuth"; 

type FacebookLoginButtonProps = {
  isLoading?: boolean;
  defaultText?: string;
  loadingText?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export function FacebookLoginButton({ 
  isLoading, 
  defaultText = "Продовжити з",
  loadingText = "Вхід...",
  onSuccess,
  onError
}: FacebookLoginButtonProps) {
  const [isFacebookLoading, setFacebookLoading] = useState(false);
  const { signInWithOAuth } = useAuth();

  const handleFacebookLogin = async () => {
    setFacebookLoading(true);
    
    try {
      // Initialize Facebook SDK
      await initFacebookSDK();
      
      // Use Promise-based FB.login
      const response = await new Promise<any>((resolve, reject) => {
        FB.login((response) => {
          if (response.authResponse) {
            resolve(response);
          } else {
            reject(new Error('Facebook login was cancelled or failed'));
          }
        }, { 
          scope: 'email,public_profile',
          return_scopes: true
        });
      });
      
      const accessToken = response.authResponse.accessToken;
      console.log(`AccessToken Facebook: ${accessToken}`);
      
      if (accessToken) {
        const userInfo = await getFacebookUserInfo(accessToken);
        await handleBackendLogin(accessToken);
      } else {
        throw new Error('No access token received from Facebook');
      }
      
    } catch (error) {
      console.error('Facebook login error:', error);
      setFacebookLoading(false);
      onError?.(error instanceof Error ? error.message : 'Facebook login failed');
    }
  };

  // Function to get user info with email
  const getFacebookUserInfo = (accessToken: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      FB.api(
        '/me',
        {
          fields: 'id,name,email,first_name,last_name,picture.type(large),permissions',
          access_token: accessToken
        },
        (response: any) => {
          if (response.error) {
            console.error('Facebook API error:', response.error);
            reject(new Error(response.error.message));
          } else {
            resolve(response);
          }
        }
      );
    });
  };

  const handleBackendLogin = async (accessToken: string) => {
    try {
      const { error } = await signInWithOAuth("facebook", accessToken);
      
      if (error) {
        onError?.(error);
      } else {
        onSuccess?.();
      }
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : "Backend login failed"
      );
    } finally {
      setFacebookLoading(false);
    }
  };

  const isButtonLoading = isLoading || isFacebookLoading;

  return (
    <button
      onClick={handleFacebookLogin}
      disabled={isButtonLoading}
      className="bg-[#f2f2f2] box-border content-stretch flex gap-[8px] h-[52px] items-center px-[16px] py-[4px] relative rounded-[16px] shrink-0 cursor-pointer hover:bg-[#e8e8e8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      data-name="Facebook"
      type="button"
    >
      {/* Border overlay */}
      <div aria-hidden="true" className="absolute border border-[#b3b3b3] border-solid inset-0 pointer-events-none rounded-[16px]" />
      
      {/* Logo */}
      <div className="relative shrink-0 size-[27px]" data-name="Facebook-Logo">
        <img 
          alt="Facebook" 
          className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" 
          src={imgFacebookLogo} 
        />
      </div>
      
      {/* Text */}
      <div className="flex flex-col justify-end leading-[0] relative shrink-0 text-[#0d0d0d] text-[0px] text-nowrap" style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" }}>
        <p className="leading-[normal] whitespace-pre">
          <span className="text-[18px]">{isButtonLoading ? loadingText : defaultText}</span>
          <span className="text-[16px]"> </span>
          <span className="text-[18px]">Facebook</span>
        </p>
      </div>
    </button>
  );
}

// Facebook SDK initialization function
function initFacebookSDK(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.FB) {
      resolve();
      return;
    }

    window.fbAsyncInit = function() {
      if (!window.FB) {
        reject(new Error('Facebook SDK failed to load'));
        return;
      }

      FB.init({
        appId: import.meta.env.VITE_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      
      resolve();
    };

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      
      script.onerror = () => {
        reject(new Error('Failed to load Facebook SDK'));
      };
      
      document.head.appendChild(script);
    } else {
      let attempts = 0;
      const checkFB = setInterval(() => {
        attempts++;
        if (window.FB) {
          clearInterval(checkFB);
          resolve();
        } else if (attempts > 10) {
          clearInterval(checkFB);
          reject(new Error('Facebook SDK initialization timeout'));
        }
      }, 500);
    }
  });
}

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init: (config: any) => void;
      login: (callback: (response: any) => void, options?: any) => void;
      getLoginStatus: (callback: (response: any) => void) => void;
      api: (path: string, params: any, callback: (response: any) => void) => void;
    };
  }
}