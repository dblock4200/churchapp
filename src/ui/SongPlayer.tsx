import React from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// Native: the same embed inside a WebView. (Metro picks SongPlayer.web.tsx on web.)
export function SongPlayer({ embedUrl, height }: { embedUrl: string; height: number }) {
  return (
    <View style={{ height }}>
      <WebView
        source={{ uri: embedUrl }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
      />
    </View>
  );
}
