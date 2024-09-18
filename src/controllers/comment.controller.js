import mongoose from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Like } from "../models/like.models.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(400, "Video not found")
    }

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: {$in: [req.user?._id, "$likes.likedBy"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $projects: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    userName: 1,
                    fullName: 1,
                    avatar: 1
                },
                isLiked: 1
            }

        }
    ])

    const option = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }

    const comments = await Comment.aggregatePaginate(commentsAggregate, options)

    return res
    .status(200)
    .json(new ApiResponse(200, {comments}, "Comments fetched succcessfully"))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    
    const { content } = req.body
    if(!content.trim()) {
        throw new ApiError(400, "Fill comment field")
    }
    
    const comment = await Comment.create({
        content,
        video: req.params,
        owner: req.user?._id
    })

    if(!comment) {
        throw new ApiError(500, "Something went wrong while adding your comment")
    }

    return res
    .status(200)
    .json(200, {comment}, "Comment added successfully")
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { content } = req.body
    const { oldComment } = req.params
    if(!content.trim()) {
        throw new ApiError(400, "Fill all the form")
    }
    if(oldComment._id !== req.user._id) {
        throw new ApiError(400, "Only comment owner can delete the comment")
    }
    const newComment = await Comment.findByIdAndUpdate(
        oldComment,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, {newComment}, "Comment changed successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentID } = req.params
    if(!commentID) {
        throw new ApiError(400, "Select the comment you want to delete")
    }
    const {comment} = await Comment.findById(commentID)
    if(!comment) {
        throw new ApiError(400, "Comment not found")
    }
    if(comment?.owner !== req.user?._id) {
        throw new ApiError(400, "Only comment owner can delete their comment")
    }
    await Comment.findByIdAndDelete(commentID)
    await Like.deleteMany({
        comment: commentID
    })
    return res
            .status(200)
            .json(new ApiResponse(200, {}, "Comment deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
    }