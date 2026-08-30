allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

val newBuildDir: Directory =
    rootProject.layout.buildDirectory
        .dir("../../build")
        .get()
rootProject.layout.buildDirectory.value(newBuildDir)

subprojects {
    val newSubprojectBuildDir: Directory = newBuildDir.dir(project.name)
    project.layout.buildDirectory.value(newSubprojectBuildDir)
}

subprojects {
    project.evaluationDependsOn(":app")
}

// Force all subprojects to use compileSdk 36 and targetSdk 36
subprojects {
    val configureAndroid = {
        if (project.extensions.findByName("android") != null) {
            project.extensions.configure<com.android.build.gradle.BaseExtension>("android") {
                compileSdkVersion(36)
                defaultConfig.targetSdkVersion(36)
            }
        }
    }
    if (project.state.executed) {
        configureAndroid()
    } else {
        afterEvaluate { configureAndroid() }
    }
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
