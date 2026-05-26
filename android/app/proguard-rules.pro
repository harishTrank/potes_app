# Rules for Glide (used by react-native-fast-image)
-keep public class * implements com.bumptech.glide.module.GlideModule
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public enum com.bumptech.glide.load.ImageHeaderParser$ImageType {*;}
-keep class com.bumptech.glide.load.data.DefaultDataStreamFetcher {*;}
-keep class com.bumptech.glide.load.data.HttpUrlFetcher {*;}
-keep class com.bumptech.glide.load.data.StreamLocalUriFetcher {*;}