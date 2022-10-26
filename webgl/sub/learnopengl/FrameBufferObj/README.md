## FrameBuffer
### [帧缓冲](https://learnopengl-cn.github.io/04%20Advanced%20OpenGL/05%20Framebuffers/)

### webgl 编程指南 
> 高级技术 =》 渲染到纹理 介绍了 利用帧缓冲作为纹理渲染

#### 定义
> 到目前为止，我们已经使用了很多屏幕缓冲了：用于写入颜色值的颜色缓冲、用于写入深度信息的深度缓冲和允许我们根据一些条件丢弃特定片段的模板缓冲。这些缓冲结合起来叫做帧缓冲(Framebuffer)，它被储存在内存中。OpenGL允许我们定义我们自己的帧缓冲，也就是说我们能够定义我们自己的颜色缓冲，甚至是深度缓冲和模板缓冲。

> 我们目前所做的所有操作都是在默认帧缓冲的渲染缓冲上进行的。默认的帧缓冲是在你创建窗口的时候生成和配置的（GLFW帮我们做了这些）。有了我们自己的帧缓冲，我们就能够有更多方式来渲染了。

> 帧缓冲4要素
1. 附加至少一个缓冲（颜色、深度或模板缓冲）。
2. 至少有一个颜色附件(Attachment)。
3. 所有的附件都必须是完整的（保留了内存）。
4. 每个缓冲都应该有相同的样本数。