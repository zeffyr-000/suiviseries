
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: GoogleIdConfiguration) => void;
                    prompt: (momentListener?: (notification: PromptMomentNotification) => void) => void;
                    renderButton: (parent: HTMLElement, options: GsiButtonConfiguration) => void;
                    disableAutoSelect: () => void;
                    storeCredential: (credential: { id: string; password: string }) => void;
                    cancel: () => void;
                    onGoogleLibraryLoad: () => void;
                    revoke: (hint: string, callback: (response: RevocationResponse) => void) => void;
                };
            };
        };
    }
}

export interface GoogleIdConfiguration {
    client_id: string;
    callback: (credentialResponse: CredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: 'signin' | 'signup' | 'use';
    login_uri?: string;
    native_callback?: string;
    ux_mode?: 'popup' | 'redirect';
    allowed_parent_origin?: string;
    intermediate_iframe_close_callback?: () => void;
}

export interface CredentialResponse {
    credential: string;
    select_by: 'auto' | 'user' | 'user_1tap' | 'user_2tap' | 'btn' | 'btn_confirm' | 'btn_add_session' | 'btn_confirm_add_session';
    clientId?: string;
}

export interface GsiButtonConfiguration {
    type?: 'standard' | 'icon';
    theme?: 'outline' | 'filled_blue' | 'filled_black';
    size?: 'large' | 'medium' | 'small';
    text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
    shape?: 'rectangular' | 'pill' | 'circle' | 'square';
    logo_alignment?: 'left' | 'center';
    width?: string | number;
    locale?: string;
    click_listener?: () => void;
}

export interface PromptMomentNotification {
    getMomentType(): 'display' | 'skipped' | 'dismissed';
    getDismissedReason(): 'credential_returned' | 'cancel_called' | 'flow_restarted' | 'opt_out_or_no_session' | 'secure_http_required' | 'unregistered_origin' | 'unknown_reason';
    getSkippedReason(): 'auto_cancel' | 'user_cancel' | 'tap_outside' | 'issuing_failed';
    getNotDisplayedReason(): 'browser_not_supported' | 'invalid_client' | 'missing_client_id' | 'opt_out_or_no_session' | 'secure_http_required' | 'suppressed_by_user' | 'unregistered_origin' | 'unknown_reason';
    isDisplayMoment(): boolean;
    isDisplayed(): boolean;
    isNotDisplayed(): boolean;
    isSkipped(): boolean;
    isDismissed(): boolean;
}

export interface RevocationResponse {
    successful: boolean;
    error?: string;
}

export const isGoogleLibraryLoaded = (): boolean => {
    return typeof window !== 'undefined' && Boolean(window.google?.accounts?.id);
};

export const waitForGoogleLibrary = (): Promise<void> => {
    return new Promise((resolve) => {
        if (isGoogleLibraryLoaded()) {
            resolve();
            return;
        }

        const checkLoaded = () => {
            if (isGoogleLibraryLoaded()) {
                resolve();
            } else {
                setTimeout(checkLoaded, 100);
            }
        };

        checkLoaded();
    });
};