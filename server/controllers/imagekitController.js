import ImageKit from 'imagekit';

export const getAuthParams = (req, res) => {
  try {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!publicKey || !privateKey || !urlEndpoint) {
      // Mock / fallback for local development if ImageKit credentials aren't set
      return res.status(200).json({
        token: 'local_dev_token_' + Date.now(),
        expire: Math.floor(Date.now() / 1000) + 1800,
        signature: 'local_dev_signature_mock'
      });
    }

    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint
    });

    const authenticationParameters = imagekit.getAuthenticationParameters();
    return res.status(200).json(authenticationParameters);
  } catch (error) {
    console.error('[ImageKit Auth Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate ImageKit authentication parameters.',
      error: error.message
    });
  }
};
