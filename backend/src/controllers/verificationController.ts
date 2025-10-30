import { Request, Response } from 'express'
import { User, Notification } from '../models'
import { asyncHandler, ApiErrorClass } from '../middleware/errorMiddleware'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads/verification')
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${req.user._id}_${Date.now()}_${file.originalname}`
    cb(null, uniqueName)
  }
})

const fileFilter = (req: any, file: any, cb: any) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new ApiErrorClass('Only image files are allowed', 400), false)
  }
}

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter
})

// Nigerian NIN Validation Service
interface NINValidationResult {
  isValid: boolean
  data?: {
    fullName: string
    dateOfBirth: string
    gender: string
    phoneNumber?: string
  }
  error?: string
}

class NINValidationService {
  static async validateNIN(nin: string): Promise<NINValidationResult> {
    try {
      // TODO: Integrate with actual NIN validation API
      // For now, return mock validation
      
      if (nin.length !== 11 || !/^\d+$/.test(nin)) {
        return {
          isValid: false,
          error: 'Invalid NIN format'
        }
      }

      // Mock successful validation
      return {
        isValid: true,
        data: {
          fullName: 'John Doe',
          dateOfBirth: '1990-01-01',
          gender: 'Male',
          phoneNumber: '+2348012345678'
        }
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'NIN validation service unavailable'
      }
    }
  }
}

// @desc    Validate NIN
// @route   POST /api/users/validate-nin
// @access  Private
export const validateNIN = asyncHandler(async (req: Request, res: Response) => {
  const { nin } = req.body

  if (!nin) {
    throw new ApiErrorClass('NIN is required', 400)
  }

  const validation = await NINValidationService.validateNIN(nin)

  if (validation.isValid) {
    res.json({
      success: true,
      data: validation.data,
      message: 'NIN validated successfully'
    })
  } else {
    res.status(400).json({
      success: false,
      message: validation.error || 'Invalid NIN'
    })
  }
})

// @desc    Submit verification documents
// @route   POST /api/users/verify
// @access  Private
export const submitVerification = asyncHandler(async (req: Request, res: Response) => {
  const { nin, businessType, businessName, businessAddress } = req.body
  const files = req.files as { [fieldname: string]: Express.Multer.File[] }

  if (!nin) {
    throw new ApiErrorClass('NIN is required', 400)
  }

  // Validate NIN first
  const ninValidation = await NINValidationService.validateNIN(nin)
  if (!ninValidation.isValid) {
    throw new ApiErrorClass('Invalid NIN', 400)
  }

  // Check required files
  if (!files || !files.selfie || files.selfie.length === 0) {
    throw new ApiErrorClass('Selfie is required', 400)
  }

  if (businessType === 'business') {
    if (!businessName || !businessAddress) {
      throw new ApiErrorClass('Business name and address are required for business accounts', 400)
    }
    if (!files.businessRegistration || files.businessRegistration.length === 0) {
      throw new ApiErrorClass('Business registration document is required', 400)
    }
  }

  // Prepare verification data
  const verificationData: any = {
    nin,
    businessType: businessType || 'individual',
    ninValidation: ninValidation.data,
    documents: {
      selfie: files.selfie[0].filename
    },
    submittedAt: new Date(),
    status: 'pending'
  }

  if (businessType === 'business') {
    verificationData.businessName = businessName
    verificationData.businessAddress = businessAddress
  }

  // Add optional documents
  if (files.ninImage && files.ninImage.length > 0) {
    verificationData.documents.ninImage = files.ninImage[0].filename
  }
  if (files.businessRegistration && files.businessRegistration.length > 0) {
    verificationData.documents.businessRegistration = files.businessRegistration[0].filename
  }
  if (files.utilityBill && files.utilityBill.length > 0) {
    verificationData.documents.utilityBill = files.utilityBill[0].filename
  }

  // Update user verification
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      verification: verificationData,
      verificationStatus: 'pending'
    },
    { new: true }
  )

  if (!user) {
    throw new ApiErrorClass('User not found', 404)
  }

  // Create notification for admins
  await (Notification as any).createForAdmins(
    'verification_submitted',
    'New Verification Submitted',
    `${user.fullName} has submitted verification documents`,
    {
      userId: user._id,
      userEmail: user.email
    }
  )

  res.json({
    success: true,
    data: {
      verificationId: user._id,
      status: 'pending'
    },
    message: 'Verification submitted successfully'
  })
})

// @desc    Get verification status
// @route   GET /api/users/verification-status
// @access  Private
export const getVerificationStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user._id).select('verification verificationStatus')

  if (!user) {
    throw new ApiErrorClass('User not found', 404)
  }

  res.json({
    success: true,
    data: {
      status: user.verificationStatus || 'not_submitted',
      verification: user.verification
    }
  })
})

// @desc    Get all pending verifications (Admin only)
// @route   GET /api/users/verifications/pending
// @access  Private/Admin
export const getPendingVerifications = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const skip = (page - 1) * limit

  const verifications = await User.find({
    verificationStatus: 'pending'
  })
    .select('fullName email phone verification createdAt')
    .sort({ 'verification.submittedAt': -1 })
    .skip(skip)
    .limit(limit)

  const total = await User.countDocuments({ verificationStatus: 'pending' })

  res.json({
    success: true,
    data: {
      verifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  })
})

// @desc    Review verification (Admin only)
// @route   POST /api/users/:userId/review-verification
// @access  Private/Admin
export const reviewVerification = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params
  const { action, reason } = req.body // action: 'approve' | 'reject'

  if (!['approve', 'reject'].includes(action)) {
    throw new ApiErrorClass('Invalid action. Must be approve or reject', 400)
  }

  if (action === 'reject' && !reason) {
    throw new ApiErrorClass('Reason is required for rejection', 400)
  }

  const user = await User.findById(userId)
  if (!user) {
    throw new ApiErrorClass('User not found', 404)
  }

  if (user.verificationStatus !== 'pending') {
    throw new ApiErrorClass('No pending verification found for this user', 400)
  }

  // Update verification status
  const newStatus = action === 'approve' ? 'approved' : 'rejected'
  user.verificationStatus = newStatus
  user.isVerified = action === 'approve'

  if (user.verification) {
    user.verification.status = newStatus
    user.verification.reviewedAt = new Date()
    user.verification.reviewedBy = req.user._id
    if (reason) {
      user.verification.rejectionReason = reason
    }
  }

  await user.save()

  // Create notification for user
  const notificationTitle = action === 'approve' 
    ? 'Verification Approved' 
    : 'Verification Rejected'
  
  const notificationMessage = action === 'approve'
    ? 'Congratulations! Your seller verification has been approved.'
    : `Your verification was rejected. Reason: ${reason}`

  await (Notification as any).createForUser(
    user._id,
    'verification_reviewed',
    notificationTitle,
    notificationMessage,
    {
      action,
      reason: reason || null
    }
  )

  res.json({
    success: true,
    data: {
      userId: user._id,
      status: newStatus
    },
    message: `Verification ${action}d successfully`
  })
})

// @desc    Get verification document
// @route   GET /api/users/verification/document/:filename
// @access  Private/Admin
export const getVerificationDocument = asyncHandler(async (req: Request, res: Response) => {
  const { filename } = req.params

  // Security check - only allow access to verification documents
  if (!filename || filename.includes('..') || filename.includes('/')) {
    throw new ApiErrorClass('Invalid filename', 400)
  }

  const filePath = path.join(process.cwd(), 'uploads/verification', filename)

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new ApiErrorClass('Document not found', 404)
  }

  // Additional security - verify the requesting user has access
  // Admin can access all, users can only access their own
  if (req.user.role !== 'admin') {
    // Extract user ID from filename (format: userId_timestamp_originalname)
    const fileUserId = filename.split('_')[0]
    if (fileUserId !== req.user._id.toString()) {
      throw new ApiErrorClass('Access denied', 403)
    }
  }

  res.sendFile(filePath)
})

// @desc    Re-submit verification after rejection
// @route   POST /api/users/resubmit-verification
// @access  Private
export const resubmitVerification = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    throw new ApiErrorClass('User not found', 404)
  }

  if (user.verificationStatus !== 'rejected') {
    throw new ApiErrorClass('Can only resubmit rejected verifications', 400)
  }

  // Reset verification status to allow new submission
  user.verificationStatus = 'not_submitted'
  user.verification = undefined
  await user.save()

  res.json({
    success: true,
    message: 'Verification reset. You can now submit new documents.'
  })
})




