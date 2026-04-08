package expo.modules.filesystem

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.IOException
import java.net.URL

class ReactNativeFilesystemModule : Module() {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ReactNativeFilesystem')` in JavaScript.
    Name("ReactNativeFilesystem")

    // Defines constant property on the module.
    Constant("PI") {
      Math.PI
    }

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
    }

    AsyncFunction("exists") { path: String ->
      File(path).exists()
    }

    AsyncFunction("readFile") { path: String ->
      val file = File(path)
      if (!file.exists()) {
        throw IOException("File does not exist at path: $path")
      }
      file.readText(Charsets.UTF_8)
    }

    AsyncFunction("writeFile") { path: String, contents: String ->
      val file = File(path)
      file.parentFile?.mkdirs()
      file.writeText(contents, Charsets.UTF_8)
    }

    AsyncFunction("deleteFile") { path: String ->
      val file = File(path)
      if (!file.exists()) {
        return@AsyncFunction
      }

      if (!deleteRecursively(file)) {
        throw IOException("Unable to delete path: $path")
      }
    }

    AsyncFunction("mkdir") { path: String ->
      val directory = File(path)
      if (directory.exists()) {
        if (!directory.isDirectory) {
          throw IOException("Path already exists and is not a directory: $path")
        }
      } else if (!directory.mkdirs()) {
        throw IOException("Unable to create directory: $path")
      }
    }

    AsyncFunction("readdir") { path: String ->
      val directory = File(path)
      if (!directory.exists()) {
        throw IOException("Directory does not exist at path: $path")
      }
      if (!directory.isDirectory) {
        throw IOException("Path is not a directory: $path")
      }

      directory.list()?.toList() ?: emptyList()
    }

    AsyncFunction("stat") { path: String ->
      val file = File(path)
      if (!file.exists()) {
        return@AsyncFunction mapOf(
          "path" to path,
          "exists" to false,
          "isFile" to false,
          "isDirectory" to false,
          "size" to 0L,
          "modificationTime" to null
        )
      }

      mapOf(
        "path" to path,
        "exists" to true,
        "isFile" to file.isFile,
        "isDirectory" to file.isDirectory,
        "size" to file.length(),
        "modificationTime" to file.lastModified().toDouble() / 1000.0
      )
    }

    AsyncFunction("move") { from: String, to: String ->
      val source = File(from)
      val destination = File(to)

      if (!source.exists()) {
        throw IOException("Source path does not exist: $from")
      }

      destination.parentFile?.mkdirs()
      if (destination.exists() && !deleteRecursively(destination)) {
        throw IOException("Unable to replace existing destination: $to")
      }

      if (!source.renameTo(destination)) {
        copyFileOrDirectory(source, destination)
        if (!deleteRecursively(source)) {
          throw IOException("Move completed, but cleanup failed for source: $from")
        }
      }
    }

    AsyncFunction("copy") { from: String, to: String ->
      val source = File(from)
      val destination = File(to)

      if (!source.exists()) {
        throw IOException("Source path does not exist: $from")
      }

      copyFileOrDirectory(source, destination)
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(ReactNativeFilesystemView::class) {
      // Defines a setter for the `url` prop.
      Prop("url") { view: ReactNativeFilesystemView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      // Defines an event that the view can send to JavaScript.
      Events("onLoad")
    }
  }

  private fun deleteRecursively(file: File): Boolean {
    if (file.isDirectory) {
      file.listFiles()?.forEach { child ->
        if (!deleteRecursively(child)) {
          return false
        }
      }
    }

    return file.delete()
  }

  private fun copyFileOrDirectory(source: File, destination: File) {
    if (destination.exists() && !deleteRecursively(destination)) {
      throw IOException("Unable to replace existing destination: ${destination.path}")
    }

    if (source.isDirectory) {
      if (!destination.exists() && !destination.mkdirs()) {
        throw IOException("Unable to create directory: ${destination.path}")
      }

      source.listFiles()?.forEach { child ->
        copyFileOrDirectory(child, File(destination, child.name))
      }
      return
    }

    destination.parentFile?.mkdirs()
    source.inputStream().use { input ->
      destination.outputStream().use { output ->
        input.copyTo(output)
      }
    }
  }
}
