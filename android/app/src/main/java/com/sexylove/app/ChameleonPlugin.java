package com.sexylove.app;

import android.content.ComponentName;
import android.content.pm.PackageManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "Chameleon")
public class ChameleonPlugin extends Plugin {

    @PluginMethod
    public void setAlias(PluginCall call) {
        String newAliasName = call.getString("alias");

        if (newAliasName == null) {
            call.reject("Alias name is required");
            return;
        }

        PackageManager pm = getContext().getPackageManager();
        String packageName = getContext().getPackageName();
        
        // Disable all aliases first (to avoid duplicates or confusion)
        // Note: In reality, we should check which one is enabled, but disabling all known aliases is safer
        // provided we know the list. For simplicity, we assume we switch FROM current TO new.
        // Actually, cleaner approach: Disable the specific class names we know.
        
        String[] allAliases = {
            ".AliasPideUnDeseo",
            ".AliasNaaam",
            ".AliasAzulinaa",
            ".AliasMuaah",
            ".AliasTamuu",
            ".AliasKissKiss",
            ".AliasUuuf",
            ".AliasPlop",
            ".AliasHohoho",
            ".AliasWow",
            ".AliasXoxo"
        };
        
        try {
            // 1. Disable ALL known aliases
            for (String alias : allAliases) {
                ComponentName componentName = new ComponentName(packageName, packageName + alias);
                pm.setComponentEnabledSetting(
                    componentName,
                    PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
                    PackageManager.DONT_KILL_APP
                );
            }

            // 2. Enable the requested one
            // Build full class name for the target alias
            // If user passes "AliasAzulinaa", we prepend package if needed, but above we used relative syntax in manifest
            // In Java we need absolute.
            
            // Check if input is "AliasAzulinaa" or ".AliasAzulinaa"
            String targetName = newAliasName.startsWith(".") ? newAliasName : "." + newAliasName;
            
            ComponentName targetComponent = new ComponentName(packageName, packageName + targetName);
            
            pm.setComponentEnabledSetting(
                targetComponent,
                PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
                PackageManager.DONT_KILL_APP
            );

            call.resolve();
            
        } catch (Exception e) {
            call.reject("Failed to set alias: " + e.getMessage());
        }
    }
}
