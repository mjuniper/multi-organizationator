# multi-organizationator

This app demonstrates how we can seamlessly access community org items while logged in to the enterprise org.

## Overall flow

1. User lands as page and logs in to the enterprise org
1. User goes to the "Enterprise" tab and sees private items
1. User clicks the "Community" tab
1. Since the user has not logged in to the community org (we do not have token info in localStorage), user is redirected to the signin-route which, in the context of this app is for signing in to the community org
1. User provides community org credentials
1. App validates that the user who just signed in is correct (ie, they signed in to the community org and did so as the user stored on portalProperties of the enterprise org) and if so, caches the token info in localStorage (and in memory)
1. App redirects to /community and user sees private items in the community org
1. User can now switch between tabs seemlessly because we have a token in memory
1. If user refreshes the page, they will not be prompted for communty org credentials because we have them in localStorage
1. After two weeks user may be prompted for community org credentials again
