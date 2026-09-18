package com.kancheking.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Voice chat needs the microphone. WebView's own internal grant
        // (below, in onStart) only works if the OS-level RECORD_AUDIO
        // permission has ALSO been granted to the app — request it here so
        // the system permission popup shows the first time the app opens.
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.RECORD_AUDIO}, 1001);
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        // Fix: round-result win/loss announcement sounds were not playing in
        // the app (they worked fine in a regular mobile browser). Android's
        // WebView can block audio/video playback that isn't triggered by a
        // direct tap in that exact instant — the announcement sound plays a
        // moment after the guess is submitted (once the server responds),
        // which WebView doesn't always count as "the same" user gesture.
        // This setting tells the WebView to allow media playback without
        // requiring that strict direct-gesture link, matching browser behavior.
        this.bridge.getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);

        // Voice chat feature: the web page calls getUserMedia({audio:true})
        // for the in-match open-mic voice call. Android's WebView blocks
        // that by default unless the app explicitly grants the request —
        // this extends Capacitor's own WebChromeClient so file uploads,
        // fullscreen video etc. from other plugins keep working normally,
        // and just adds the microphone grant on top.
        this.bridge.getWebView().setWebChromeClient(new BridgeWebChromeClient(this.bridge) {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> request.grant(request.getResources()));
            }
        });
    }
}
