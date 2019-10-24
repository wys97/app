package com.hqcgj.driver.wxapi;

import android.os.Bundle;
import android.app.Activity;

import com.theweflex.react.WeChatModule;


public class WXEntryActivity extends Activity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WeChatModule.handleIntent(getIntent());
        finish();
    }
}
