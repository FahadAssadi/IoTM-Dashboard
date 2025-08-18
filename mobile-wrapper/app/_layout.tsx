import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

export default function AppLayout() {
  const webAppUrl = 'http://192.168.1.111:3000'; 

  return (
    <SafeAreaView style={styles.container}>
      <WebView source={{ uri: webAppUrl }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});