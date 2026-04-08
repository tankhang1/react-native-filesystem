import ExpoModulesCore
import Foundation

public class ReactNativeFilesystemModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('ReactNativeFilesystem')` in JavaScript.
    Name("ReactNativeFilesystem")

    // Defines constant property on the module.
    Constant("PI") {
      Double.pi
    }

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      self.sendEvent("onChange", [
        "value": value
      ])
    }

    AsyncFunction("exists") { (path: String) -> Bool in
      FileManager.default.fileExists(atPath: path)
    }

    AsyncFunction("readFile") { (path: String) throws -> String in
      guard FileManager.default.fileExists(atPath: path) else {
        throw NSError(
          domain: "ReactNativeFilesystem",
          code: 404,
          userInfo: [NSLocalizedDescriptionKey: "File does not exist at path: \(path)"]
        )
      }

      return try String(contentsOfFile: path, encoding: .utf8)
    }

    AsyncFunction("writeFile") { (path: String, contents: String) throws in
      let url = URL(fileURLWithPath: path)
      let parentDirectory = url.deletingLastPathComponent()

      try FileManager.default.createDirectory(
        at: parentDirectory,
        withIntermediateDirectories: true,
        attributes: nil
      )
      try contents.write(to: url, atomically: true, encoding: .utf8)
    }

    AsyncFunction("deleteFile") { (path: String) throws in
      guard FileManager.default.fileExists(atPath: path) else {
        return
      }

      try FileManager.default.removeItem(atPath: path)
    }

    AsyncFunction("mkdir") { (path: String) throws in
      try FileManager.default.createDirectory(
        atPath: path,
        withIntermediateDirectories: true,
        attributes: nil
      )
    }

    AsyncFunction("readdir") { (path: String) throws -> [String] in
      var isDirectory: ObjCBool = false
      let exists = FileManager.default.fileExists(atPath: path, isDirectory: &isDirectory)

      guard exists else {
        throw NSError(
          domain: "ReactNativeFilesystem",
          code: 404,
          userInfo: [NSLocalizedDescriptionKey: "Directory does not exist at path: \(path)"]
        )
      }

      guard isDirectory.boolValue else {
        throw NSError(
          domain: "ReactNativeFilesystem",
          code: 400,
          userInfo: [NSLocalizedDescriptionKey: "Path is not a directory: \(path)"]
        )
      }

      return try FileManager.default.contentsOfDirectory(atPath: path)
    }

    AsyncFunction("stat") { (path: String) throws -> [String: Any] in
      var isDirectory: ObjCBool = false
      let exists = FileManager.default.fileExists(atPath: path, isDirectory: &isDirectory)

      if !exists {
        return [
          "path": path,
          "exists": false,
          "isFile": false,
          "isDirectory": false,
          "size": 0,
          "modificationTime": NSNull()
        ]
      }

      let attributes = try FileManager.default.attributesOfItem(atPath: path)
      let fileSize = (attributes[.size] as? NSNumber)?.int64Value ?? 0
      let modificationDate = attributes[.modificationDate] as? Date

      return [
        "path": path,
        "exists": true,
        "isFile": !isDirectory.boolValue,
        "isDirectory": isDirectory.boolValue,
        "size": fileSize,
        "modificationTime": modificationDate?.timeIntervalSince1970 ?? NSNull()
      ]
    }

    AsyncFunction("move") { (from: String, to: String) throws in
      guard FileManager.default.fileExists(atPath: from) else {
        throw NSError(
          domain: "ReactNativeFilesystem",
          code: 404,
          userInfo: [NSLocalizedDescriptionKey: "Source path does not exist: \(from)"]
        )
      }

      let destinationURL = URL(fileURLWithPath: to)
      try FileManager.default.createDirectory(
        at: destinationURL.deletingLastPathComponent(),
        withIntermediateDirectories: true,
        attributes: nil
      )

      if FileManager.default.fileExists(atPath: to) {
        try FileManager.default.removeItem(atPath: to)
      }

      do {
        try FileManager.default.moveItem(atPath: from, toPath: to)
      } catch {
        try self.copyItem(from: from, to: to)
        try FileManager.default.removeItem(atPath: from)
      }
    }

    AsyncFunction("copy") { (from: String, to: String) throws in
      try self.copyItem(from: from, to: to)
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(ReactNativeFilesystemView.self) {
      // Defines a setter for the `url` prop.
      Prop("url") { (view: ReactNativeFilesystemView, url: URL) in
        if view.webView.url != url {
          view.webView.load(URLRequest(url: url))
        }
      }

      Events("onLoad")
    }
  }

  private func copyItem(from: String, to: String) throws {
    guard FileManager.default.fileExists(atPath: from) else {
      throw NSError(
        domain: "ReactNativeFilesystem",
        code: 404,
        userInfo: [NSLocalizedDescriptionKey: "Source path does not exist: \(from)"]
      )
    }

    let destinationURL = URL(fileURLWithPath: to)
    try FileManager.default.createDirectory(
      at: destinationURL.deletingLastPathComponent(),
      withIntermediateDirectories: true,
      attributes: nil
    )

    if FileManager.default.fileExists(atPath: to) {
      try FileManager.default.removeItem(atPath: to)
    }

    try FileManager.default.copyItem(atPath: from, toPath: to)
  }
}
